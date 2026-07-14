#![no_std]
#![allow(deprecated)]
#![allow(unused_imports)]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Symbol, Vec,
};


#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RoomState {
    Open,
    Completed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Room {
    pub admin: Address,
    pub title: String,
    pub description: String,
    pub capacity: u32,
    pub total_winners: u32,
    pub claim_session_start: u64,
    pub reward_pool: i128,
    pub token_address: Address,
    pub state: RoomState,
    pub reward_per_winner: i128,
}

#[contracttype]
pub enum DataKey {
    PlatformWallet,
    RoomCount,
    Room(u32),
    HasJoined(u32, Address), // (room_id, user)
    IsWinner(u32, Address),
    IsRewardClaimed(u32, Address),
    RoomParticipants(u32), // Vec<Address>
    PlatformFeeBps,
    TokenRegistryAddress,
}

#[contract]
pub struct MultiRoomAutoDraw;

#[contractimpl]
impl MultiRoomAutoDraw {
    pub fn initialize(env: Env, platform_wallet: Address, token_registry: Address) {
        if env.storage().instance().has(&DataKey::PlatformWallet) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::PlatformWallet, &platform_wallet);
        env.storage().instance().set(&DataKey::TokenRegistryAddress, &token_registry);
        env.storage().instance().set(&DataKey::PlatformFeeBps, &50i128);
    }

    fn is_listed(env: &Env, token: &Address) -> bool {
        use soroban_sdk::IntoVal;
        let registry: Address = env.storage().instance().get(&DataKey::TokenRegistryAddress).unwrap();
        let res: bool = env.invoke_contract(
            &registry,
            &symbol_short!("is_valid"),
            soroban_sdk::vec![env, token.clone().into_val(env)],
        );
        res
    }

    pub fn set_platform_wallet(env: Env, admin: Address, new_wallet: Address) {
        admin.require_auth();
        let current_admin: Address = env.storage().instance().get(&DataKey::PlatformWallet).unwrap();
        if admin != current_admin { panic!("Hanya admin"); }
        env.storage().instance().set(&DataKey::PlatformWallet, &new_wallet);
    }

    pub fn set_fee_bps(env: Env, admin: Address, new_fee: i128) {
        admin.require_auth();
        let current_admin: Address = env.storage().instance().get(&DataKey::PlatformWallet).unwrap();
        if admin != current_admin { panic!("Hanya admin"); }
        if new_fee > 1000 { panic!("Fee maksimal 10%"); }
        env.storage().instance().set(&DataKey::PlatformFeeBps, &new_fee);
    }

    pub fn create_room(
        env: Env,
        admin: Address,
        token_address: Address,
        title: String,
        description: String,
        capacity: u32,
        total_winners: u32,
        claim_session_start: u64,
        total_reward: i128,
    ) -> u32 {
        admin.require_auth();

        if capacity == 0 {
            panic!("Capacity must be > 0");
        }
        if total_winners == 0 || total_winners > capacity {
            panic!("Invalid total winners");
        }
        if total_reward <= 0 {
            panic!("Reward must be > 0");
        }

        let platform_wallet: Address = env.storage().instance().get(&DataKey::PlatformWallet).expect("Not initialized");
        let fee_bps: i128 = env.storage().instance().get(&DataKey::PlatformFeeBps).unwrap_or(50);

        let fee = (total_reward * fee_bps) / 10000;
        let actual_reward_pool = total_reward - fee;

        if !Self::is_listed(&env, &token_address) {
            panic!("Token tidak terdaftar");
        }
        let token_client = token::Client::new(&env, &token_address);
        
        // Transfer fee to platform wallet
        token_client.transfer(&admin, &platform_wallet, &fee);
        
        // Transfer actual reward pool to this contract
        token_client.transfer(&admin, &env.current_contract_address(), &actual_reward_pool);

        let room_count: u32 = env.storage().instance().get(&DataKey::RoomCount).unwrap_or(0);

        let room = Room {
            admin: admin.clone(),
            title: title.clone(),
            description: description.clone(),
            capacity,
            total_winners,
            claim_session_start,
            reward_pool: actual_reward_pool,
            token_address: token_address.clone(),
            state: RoomState::Open,
            reward_per_winner: 0, // Will be set on draw
        };

        env.storage().persistent().set(&DataKey::Room(room_count), &room);
        
        let empty_participants: Vec<Address> = Vec::new(&env);
        env.storage().persistent().set(&DataKey::RoomParticipants(room_count), &empty_participants);
        
        env.storage().instance().set(&DataKey::RoomCount, &(room_count + 1));
        
        env.events().publish(
            (Symbol::new(&env, "RoomCreated"), room_count),
            (admin, title, description, actual_reward_pool, token_address, total_winners, capacity, claim_session_start),
        );

        room_count
    }

    pub fn join_room(env: Env, user: Address, room_id: u32) {
        user.require_auth();

        let mut room: Room = env.storage().persistent().get(&DataKey::Room(room_id)).expect("Room not found");
        
        if room.state != RoomState::Open {
            panic!("Room is not open");
        }
        
        if env.ledger().timestamp() < room.claim_session_start {
            panic!("Session has not started");
        }
        
        if user == room.admin {
            panic!("Admin cannot join own room");
        }

        let has_joined_key = DataKey::HasJoined(room_id, user.clone());
        if env.storage().persistent().has(&has_joined_key) {
            panic!("Already joined");
        }

        let mut participants: Vec<Address> = env.storage().persistent().get(&DataKey::RoomParticipants(room_id)).unwrap();
        
        if participants.len() >= room.capacity {
            panic!("Room is full");
        }

        participants.push_back(user.clone());
        env.storage().persistent().set(&has_joined_key, &true);
        env.storage().persistent().set(&DataKey::RoomParticipants(room_id), &participants);
        
        env.events().publish((Symbol::new(&env, "UserJoined"), room_id), (user.clone(), participants.len()));

        if participants.len() == room.capacity {
            // Auto draw
            room.state = RoomState::Completed;
            room.reward_per_winner = room.reward_pool / (room.total_winners as i128);
            
            let mut temp_participants = participants.clone();
            let mut winners: Vec<Address> = Vec::new(&env);
            
            for _ in 0..room.total_winners {
                let count = temp_participants.len();
                if count == 0 {
                    break;
                }
                
                let random_index = env.prng().gen_range::<u64>(0..count as u64) as u32;
                let winner = temp_participants.get(random_index).unwrap();
                
                env.storage().persistent().set(&DataKey::IsWinner(room_id, winner.clone()), &true);
                winners.push_back(winner);
                
                // Swap remove (equivalent behavior)
                temp_participants.remove(random_index);
            }
            
            env.storage().persistent().set(&DataKey::Room(room_id), &room);
            env.events().publish((Symbol::new(&env, "Completed"), room_id), (room.reward_per_winner, winners));
        }
    }


    pub fn leave_room(env: Env, user: Address, room_id: u32) {
        user.require_auth();

        let room: Room = env.storage().persistent().get(&DataKey::Room(room_id)).expect("Room not found");
        
        if room.state != RoomState::Open {
            panic!("Room is not open");
        }
        
        let has_joined_key = DataKey::HasJoined(room_id, user.clone());
        if !env.storage().persistent().has(&has_joined_key) {
            panic!("Not joined");
        }

        let mut participants: Vec<Address> = env.storage().persistent().get(&DataKey::RoomParticipants(room_id)).unwrap();
        
        // Find and remove the user
        let mut index_to_remove: Option<u32> = None;
        for (i, p) in participants.iter().enumerate() {
            if p == user {
                index_to_remove = Some(i as u32);
                break;
            }
        }
        
        if let Some(index) = index_to_remove {
            participants.remove(index);
        }
        
        env.storage().persistent().remove(&has_joined_key);
        env.storage().persistent().set(&DataKey::RoomParticipants(room_id), &participants);
        
        env.events().publish((Symbol::new(&env, "UserLeft"), room_id), (user.clone(), participants.len()));
    }

    pub fn claim_reward(env: Env, user: Address, room_id: u32) {
        user.require_auth();

        let room: Room = env.storage().persistent().get(&DataKey::Room(room_id)).expect("Room not found");
        
        if room.state != RoomState::Completed {
            panic!("Draw not completed");
        }

        let is_winner_key = DataKey::IsWinner(room_id, user.clone());
        if !env.storage().persistent().get(&is_winner_key).unwrap_or(false) {
            panic!("Not a winner");
        }

        let is_claimed_key = DataKey::IsRewardClaimed(room_id, user.clone());
        if env.storage().persistent().has(&is_claimed_key) {
            panic!("Reward already claimed");
        }

        env.storage().persistent().set(&is_claimed_key, &true);

        let token_client = token::Client::new(&env, &room.token_address);
        token_client.transfer(&env.current_contract_address(), &user, &room.reward_per_winner);
        
        env.events().publish((Symbol::new(&env, "Claimed"), room_id), (user, room.reward_per_winner));
    }
    
    // Viewers
    pub fn get_room(env: Env, room_id: u32) -> Room {
        env.storage().persistent().get(&DataKey::Room(room_id)).expect("Room not found")
    }
    
    pub fn get_participants(env: Env, room_id: u32) -> Vec<Address> {
        env.storage().persistent().get(&DataKey::RoomParticipants(room_id)).unwrap_or_else(|| Vec::new(&env))
    }
    
    pub fn is_winner(env: Env, room_id: u32, user: Address) -> bool {
        env.storage().persistent().get(&DataKey::IsWinner(room_id, user)).unwrap_or(false)
    }
}

#[cfg(test)]
mod test;

