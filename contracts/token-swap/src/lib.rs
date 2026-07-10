#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    TokenA,
    TokenB,
    ReserveA,
    ReserveB,
    AdminAddress,
}

#[contract]
pub struct TokenSwapContract;

#[contractimpl]
impl TokenSwapContract {
    /// Initializes the swap contract with two tokens and an admin fee address.
    pub fn initialize(
        env: Env,
        token_a: Address,
        token_b: Address,
        admin_address: Address,
    ) {
        if env.storage().instance().has(&DataKey::TokenA) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::TokenA, &token_a);
        env.storage().instance().set(&DataKey::TokenB, &token_b);
        env.storage().instance().set(&DataKey::AdminAddress, &admin_address);
        env.storage().instance().set(&DataKey::ReserveA, &0i128);
        env.storage().instance().set(&DataKey::ReserveB, &0i128);
    }

    /// Deposits initial liquidity into the pool. Only the admin can call this.
    pub fn deposit(env: Env, admin: Address, amount_a: i128, amount_b: i128) {
        let admin_addr: Address = env.storage().instance().get(&DataKey::AdminAddress).unwrap();
        if admin != admin_addr {
            panic!("Only admin can deposit liquidity");
        }
        admin.require_auth();

        if amount_a <= 0 || amount_b <= 0 {
            panic!("Amount must be greater than 0");
        }

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();

        let client_a = token::Client::new(&env, &token_a);
        let client_b = token::Client::new(&env, &token_b);

        client_a.transfer(&admin, &env.current_contract_address(), &amount_a);
        client_b.transfer(&admin, &env.current_contract_address(), &amount_b);

        let mut reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap();
        let mut reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap();

        reserve_a += amount_a;
        reserve_b += amount_b;

        env.storage().instance().set(&DataKey::ReserveA, &reserve_a);
        env.storage().instance().set(&DataKey::ReserveB, &reserve_b);
        
        env.events().publish(
            (symbol_short!("deposit"), admin),
            (amount_a, amount_b),
        );
    }

    /// Swaps token_in for the other token using x * y = k formula with 0.5% fee to admin.
    pub fn swap(
        env: Env,
        from: Address,
        token_in: Address,
        amount_in: i128,
        min_amount_out: i128,
    ) {
        from.require_auth();

        if amount_in <= 0 {
            panic!("Amount must be positive");
        }

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).unwrap();
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).unwrap();
        let admin_addr: Address = env.storage().instance().get(&DataKey::AdminAddress).unwrap();

        let mut reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap();
        let mut reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap();

        if reserve_a == 0 || reserve_b == 0 {
            panic!("Pool is empty");
        }

        let is_in_a = token_in == token_a;
        if !is_in_a && token_in != token_b {
            panic!("Invalid token");
        }

        // Calculate fee (0.5%)
        let fee = (amount_in * 5) / 1000;
        let amount_in_after_fee = amount_in - fee;

        if amount_in_after_fee <= 0 {
            panic!("Amount too small to cover fee");
        }

        let client_in = token::Client::new(&env, &token_in);
        // Transfer the total amount from user to contract
        client_in.transfer(&from, &env.current_contract_address(), &amount_in);

        // Transfer the fee from contract to admin
        if fee > 0 {
            client_in.transfer(&env.current_contract_address(), &admin_addr, &fee);
        }

        let amount_out: i128;
        if is_in_a {
            // y_out = y_reserve - (x_reserve * y_reserve) / (x_reserve + x_in)
            // or: y_out = (x_in * y_reserve) / (x_reserve + x_in)
            let numerator = amount_in_after_fee * reserve_b;
            let denominator = reserve_a + amount_in_after_fee;
            amount_out = numerator / denominator;
            
            reserve_a += amount_in_after_fee;
            reserve_b -= amount_out;

            let client_out = token::Client::new(&env, &token_b);
            client_out.transfer(&env.current_contract_address(), &from, &amount_out);
        } else {
            // x_out = (y_in * x_reserve) / (y_reserve + y_in)
            let numerator = amount_in_after_fee * reserve_a;
            let denominator = reserve_b + amount_in_after_fee;
            amount_out = numerator / denominator;

            reserve_b += amount_in_after_fee;
            reserve_a -= amount_out;

            let client_out = token::Client::new(&env, &token_a);
            client_out.transfer(&env.current_contract_address(), &from, &amount_out);
        }

        if amount_out < min_amount_out {
            panic!("Insufficient output amount");
        }

        env.storage().instance().set(&DataKey::ReserveA, &reserve_a);
        env.storage().instance().set(&DataKey::ReserveB, &reserve_b);
        
        env.events().publish(
            (symbol_short!("swap"), from, token_in),
            (amount_in, amount_out, fee),
        );
    }
    
    pub fn get_reserves(env: Env) -> (i128, i128) {
        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        (reserve_a, reserve_b)
    }
}
