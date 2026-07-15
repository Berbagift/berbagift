#![cfg(test)]

use crate::{MultiRoomAutoDraw, MultiRoomAutoDrawClient, RoomState};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env, String, contract, contractimpl,
};

#[contract]
pub struct DummyRegistry;
#[contractimpl]
impl DummyRegistry {
    pub fn is_valid(env: Env, token: Address) -> bool { true }
}

#[test]
fn test_giveaway_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let platform_wallet = Address::generate(&env);
    let registry_id = env.register(DummyRegistry, ());

    let contract_id = env.register(MultiRoomAutoDraw, ());
    let client = MultiRoomAutoDrawClient::new(&env, &contract_id);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = token::StellarAssetClient::new(&env, &token_contract.address());
    let token_address = token_contract.address();

    client.initialize(&platform_wallet, &registry_id);

    let room_admin = Address::generate(&env);
    token_client.mint(&room_admin, &10_000);

    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    let total_reward = 10_000;
    
    let room_id = client.create_room(
        &room_admin,
        &token_address,
        &String::from_str(&env, "Test Room"),
        &String::from_str(&env, "Room Desc"),
        &3,
        &2,
        &1000,
        &total_reward,
    );

    assert_eq!(room_id, 0);

    let token_generic_client = token::Client::new(&env, &token_address);
    let fee = (total_reward * 50) / 10000;
    let expected_pool = total_reward - fee;

    assert_eq!(token_generic_client.balance(&platform_wallet), fee);
    assert_eq!(token_generic_client.balance(&contract_id), expected_pool);
    assert_eq!(token_generic_client.balance(&room_admin), 0);

    let room = client.get_room(&room_id);
    assert_eq!(room.state, RoomState::Open);
    assert_eq!(room.reward_pool, expected_pool);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let user3 = Address::generate(&env);

    client.join_room(&user1, &room_id);
    client.join_room(&user2, &room_id);
    
    let participants_before = client.get_participants(&room_id);
    assert_eq!(participants_before.len(), 2);
    
    client.join_room(&user3, &room_id);

    let room_after = client.get_room(&room_id);
    assert_eq!(room_after.state, RoomState::Completed);
    assert_eq!(room_after.reward_per_winner, expected_pool / 2);

    let is_w1 = client.is_winner(&room_id, &user1);
    let is_w2 = client.is_winner(&room_id, &user2);
    let is_w3 = client.is_winner(&room_id, &user3);

    let winners_count = (if is_w1 { 1 } else { 0 }) + 
                        (if is_w2 { 1 } else { 0 }) + 
                        (if is_w3 { 1 } else { 0 });
    
    assert_eq!(winners_count, 2);

    let winner = if is_w1 { user1 } else { user2 };
    client.claim_reward(&winner, &room_id);

    assert_eq!(token_generic_client.balance(&winner), 4975);
}