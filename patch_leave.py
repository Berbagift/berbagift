import re

with open("contracts/multi-room-auto-draw/src/lib.rs", "r") as f:
    content = f.read()

leave_room_fn = """
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
"""

# Insert it before pub fn claim_reward
content = content.replace("    pub fn claim_reward(", leave_room_fn + "\n    pub fn claim_reward(")

with open("contracts/multi-room-auto-draw/src/lib.rs", "w") as f:
    f.write(content)
