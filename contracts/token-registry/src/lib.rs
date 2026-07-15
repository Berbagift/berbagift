#![no_std]
#![allow(deprecated)]
#![allow(unused_imports)]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
pub enum DataKey {
    Admin,
    IsAllowed(Address),
}

#[contract]
pub struct TokenRegistry;

#[contractimpl]
impl TokenRegistry {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn add_token(env: Env, admin: Address, token: Address) {
        admin.require_auth();
        let current_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != current_admin {
            panic!("Hanya admin");
        }
        
        let is_allowed: bool = env.storage().persistent().get(&DataKey::IsAllowed(token.clone())).unwrap_or(false);
        if is_allowed {
            panic!("Token sudah terdaftar");
        }

        env.storage().persistent().set(&DataKey::IsAllowed(token.clone()), &true);

        env.events().publish(
            (symbol_short!("add_token"), token),
            (),
        );
    }

    pub fn remove_token(env: Env, admin: Address, token: Address) {
        admin.require_auth();
        let current_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != current_admin {
            panic!("Hanya admin");
        }

        let is_allowed: bool = env.storage().persistent().get(&DataKey::IsAllowed(token.clone())).unwrap_or(false);
        if !is_allowed {
            panic!("Token belum terdaftar");
        }

        env.storage().persistent().set(&DataKey::IsAllowed(token.clone()), &false);

        env.events().publish(
            (symbol_short!("rm_token"), token),
            (),
        );
    }

    pub fn is_valid(env: Env, token: Address) -> bool {
        env.storage().persistent().get(&DataKey::IsAllowed(token)).unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_token_registry() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        
        let contract_id = env.register(TokenRegistry, ());
        let client = TokenRegistryClient::new(&env, &contract_id);

        client.initialize(&admin);

        assert_eq!(client.is_valid(&token), false);

        client.add_token(&admin, &token);
        assert_eq!(client.is_valid(&token), true);

        client.remove_token(&admin, &token);
        assert_eq!(client.is_valid(&token), false);
    }
}
