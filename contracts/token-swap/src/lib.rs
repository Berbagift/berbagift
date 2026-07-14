#![no_std]
#![allow(deprecated)]
#![allow(unused_imports)]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    PlatformWallet,
    BaseToken,
    TokenRegistryAddress,
    PlatformFeeBps,
    IsListed(Address),
    ReserveBase(Address),
    ReserveToken(Address),
    TotalLpSupply(Address),
}

#[contract]
pub struct TokenSwapContract;

#[contractimpl]
impl TokenSwapContract {
    pub fn initialize(
        env: Env,
        base_token: Address,
        token_registry: Address,
        platform_wallet: Address,
    ) {
        if env.storage().instance().has(&DataKey::BaseToken) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::BaseToken, &base_token);
        env.storage().instance().set(&DataKey::TokenRegistryAddress, &token_registry);
        env.storage().instance().set(&DataKey::PlatformWallet, &platform_wallet);
        env.storage().instance().set(&DataKey::PlatformFeeBps, &50u32); // 0.5%
    }

    pub fn set_platform_wallet(env: Env, admin: Address, new_wallet: Address) {
        admin.require_auth();
        let current_admin: Address = env.storage().instance().get(&DataKey::PlatformWallet).unwrap();
        if admin != current_admin { panic!("Hanya admin"); }
        env.storage().instance().set(&DataKey::PlatformWallet, &new_wallet);
    }

    pub fn set_platform_fee_bps(env: Env, admin: Address, new_fee: u32) {
        admin.require_auth();
        let current_admin: Address = env.storage().instance().get(&DataKey::PlatformWallet).unwrap();
        if admin != current_admin { panic!("Hanya admin"); }
        if new_fee > 1000 { panic!("Fee maksimal 10%"); }
        env.storage().instance().set(&DataKey::PlatformFeeBps, &new_fee);
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

    fn sqrt(x: i128) -> i128 {
        if x == 0 { return 0; }
        let mut z = (x + 1) / 2;
        let mut y = x;
        while z < y {
            y = z;
            z = (x / z + z) / 2;
        }
        y
    }

    pub fn add_liquidity(
        env: Env,
        provider: Address,
        token: Address,
        base_token_amount: i128,
        token_amount: i128,
    ) {
        provider.require_auth();
        if !Self::is_listed(&env, &token) { panic!("Token tidak terdaftar"); }
        if base_token_amount <= 0 || token_amount <= 0 { panic!("Amount harus > 0"); }

        let base_token: Address = env.storage().instance().get(&DataKey::BaseToken).unwrap();
        
        let mut reserve_base: i128 = env.storage().persistent().get(&DataKey::ReserveBase(token.clone())).unwrap_or(0);
        let mut reserve_token: i128 = env.storage().persistent().get(&DataKey::ReserveToken(token.clone())).unwrap_or(0);
        let mut total_lp: i128 = env.storage().persistent().get(&DataKey::TotalLpSupply(token.clone())).unwrap_or(0);

        let lp_to_mint;
        if total_lp == 0 {
            lp_to_mint = Self::sqrt(base_token_amount * token_amount);
            if lp_to_mint <= 0 { panic!("Likuiditas terlalu kecil"); }
        } else {
            let lp_from_base = (base_token_amount * total_lp) / reserve_base;
            let lp_from_token = (token_amount * total_lp) / reserve_token;
            lp_to_mint = if lp_from_base < lp_from_token { lp_from_base } else { lp_from_token };
            if lp_to_mint <= 0 { panic!("Likuiditas terlalu kecil"); }
        }

        let client_base = token::Client::new(&env, &base_token);
        let client_token = token::Client::new(&env, &token);

        client_base.transfer(&provider, &env.current_contract_address(), &base_token_amount);
        client_token.transfer(&provider, &env.current_contract_address(), &token_amount);

        reserve_base += base_token_amount;
        reserve_token += token_amount;
        total_lp += lp_to_mint;

        env.storage().persistent().set(&DataKey::ReserveBase(token.clone()), &reserve_base);
        env.storage().persistent().set(&DataKey::ReserveToken(token.clone()), &reserve_token);
        env.storage().persistent().set(&DataKey::TotalLpSupply(token.clone()), &total_lp);
        
        env.events().publish(
            (symbol_short!("add_liq"), provider),
            (token, base_token_amount, token_amount, lp_to_mint),
        );
    }

    pub fn swap_base_for_token(
        env: Env,
        from: Address,
        token: Address,
        base_amount_in: i128,
        min_token_out: i128,
    ) {
        from.require_auth();
        if !Self::is_listed(&env, &token) { panic!("Token tidak terdaftar"); }
        if base_amount_in <= 0 { panic!("Amount harus > 0"); }

        let mut reserve_base: i128 = env.storage().persistent().get(&DataKey::ReserveBase(token.clone())).unwrap_or(0);
        let mut reserve_token: i128 = env.storage().persistent().get(&DataKey::ReserveToken(token.clone())).unwrap_or(0);
        if reserve_base == 0 || reserve_token == 0 { panic!("Pool belum ada likuiditas"); }

        let fee_bps: u32 = env.storage().instance().get(&DataKey::PlatformFeeBps).unwrap_or(50);
        let fee_amount = (base_amount_in * (fee_bps as i128)) / 10000;
        let amount_in_after_fee = base_amount_in - fee_amount;

        let amount_out = (reserve_token * amount_in_after_fee) / (reserve_base + amount_in_after_fee);
        
        if amount_out <= 0 { panic!("Output terlalu kecil"); }
        if amount_out < min_token_out { panic!("Slippage terlalu tinggi"); }
        if amount_out >= reserve_token { panic!("Likuiditas tidak cukup"); }

        let base_token: Address = env.storage().instance().get(&DataKey::BaseToken).unwrap();
        let client_base = token::Client::new(&env, &base_token);
        let client_token = token::Client::new(&env, &token);
        let platform_wallet: Address = env.storage().instance().get(&DataKey::PlatformWallet).unwrap();

        // Transfer base from user to contract
        client_base.transfer(&from, &env.current_contract_address(), &base_amount_in);

        // Transfer fee to platform wallet
        if fee_amount > 0 {
            client_base.transfer(&env.current_contract_address(), &platform_wallet, &fee_amount);
        }

        // Transfer token out to user
        client_token.transfer(&env.current_contract_address(), &from, &amount_out);

        reserve_base += amount_in_after_fee;
        reserve_token -= amount_out;

        env.storage().persistent().set(&DataKey::ReserveBase(token.clone()), &reserve_base);
        env.storage().persistent().set(&DataKey::ReserveToken(token.clone()), &reserve_token);

        env.events().publish(
            (Symbol::new(&env, "swap_b2t"), from, token),
            (base_amount_in, amount_out, fee_amount),
        );
    }

    pub fn swap_token_for_base(
        env: Env,
        from: Address,
        token: Address,
        token_amount_in: i128,
        min_base_out: i128,
    ) {
        from.require_auth();
        if !Self::is_listed(&env, &token) { panic!("Token tidak terdaftar"); }
        if token_amount_in <= 0 { panic!("Amount harus > 0"); }

        let mut reserve_base: i128 = env.storage().persistent().get(&DataKey::ReserveBase(token.clone())).unwrap_or(0);
        let mut reserve_token: i128 = env.storage().persistent().get(&DataKey::ReserveToken(token.clone())).unwrap_or(0);
        if reserve_base == 0 || reserve_token == 0 { panic!("Pool belum ada likuiditas"); }

        let fee_bps: u32 = env.storage().instance().get(&DataKey::PlatformFeeBps).unwrap_or(50);
        let fee_amount = (token_amount_in * (fee_bps as i128)) / 10000;
        let amount_in_after_fee = token_amount_in - fee_amount;

        let amount_out = (reserve_base * amount_in_after_fee) / (reserve_token + amount_in_after_fee);
        
        if amount_out <= 0 { panic!("Output terlalu kecil"); }
        if amount_out < min_base_out { panic!("Slippage terlalu tinggi"); }
        if amount_out >= reserve_base { panic!("Likuiditas tidak cukup"); }

        let base_token: Address = env.storage().instance().get(&DataKey::BaseToken).unwrap();
        let client_base = token::Client::new(&env, &base_token);
        let client_token = token::Client::new(&env, &token);
        let platform_wallet: Address = env.storage().instance().get(&DataKey::PlatformWallet).unwrap();

        client_token.transfer(&from, &env.current_contract_address(), &token_amount_in);

        if fee_amount > 0 {
            client_token.transfer(&env.current_contract_address(), &platform_wallet, &fee_amount);
        }

        client_base.transfer(&env.current_contract_address(), &from, &amount_out);

        reserve_token += amount_in_after_fee;
        reserve_base -= amount_out;

        env.storage().persistent().set(&DataKey::ReserveBase(token.clone()), &reserve_base);
        env.storage().persistent().set(&DataKey::ReserveToken(token.clone()), &reserve_token);

        env.events().publish(
            (Symbol::new(&env, "swap_t2b"), from, token),
            (token_amount_in, amount_out, fee_amount),
        );
    }

    pub fn swap_token_for_token(
        env: Env,
        from: Address,
        token_in: Address,
        token_out: Address,
        token_amount_in: i128,
        min_token_out: i128,
    ) {
        from.require_auth();
        if !Self::is_listed(&env, &token_in) { panic!("Token in tidak terdaftar"); }
        if !Self::is_listed(&env, &token_out) { panic!("Token out tidak terdaftar"); }
        if token_amount_in <= 0 { panic!("Amount harus > 0"); }

        let mut reserve_base_in: i128 = env.storage().persistent().get(&DataKey::ReserveBase(token_in.clone())).unwrap_or(0);
        let mut reserve_token_in: i128 = env.storage().persistent().get(&DataKey::ReserveToken(token_in.clone())).unwrap_or(0);
        if reserve_base_in == 0 || reserve_token_in == 0 { panic!("Pool in kosong"); }

        let mut reserve_base_out: i128 = env.storage().persistent().get(&DataKey::ReserveBase(token_out.clone())).unwrap_or(0);
        let mut reserve_token_out: i128 = env.storage().persistent().get(&DataKey::ReserveToken(token_out.clone())).unwrap_or(0);
        if reserve_base_out == 0 || reserve_token_out == 0 { panic!("Pool out kosong"); }

        let fee_bps: u32 = env.storage().instance().get(&DataKey::PlatformFeeBps).unwrap_or(50);
        
        // Hop 1: token_in -> base
        let fee_in = (token_amount_in * (fee_bps as i128)) / 10000;
        let amount_in_after_fee = token_amount_in - fee_in;
        let base_intermediate = (reserve_base_in * amount_in_after_fee) / (reserve_token_in + amount_in_after_fee);
        if base_intermediate <= 0 { panic!("Output base terlalu kecil"); }

        // Hop 2: base -> token_out
        let fee_base = (base_intermediate * (fee_bps as i128)) / 10000;
        let base_in_after_fee = base_intermediate - fee_base;
        let amount_out = (reserve_token_out * base_in_after_fee) / (reserve_base_out + base_in_after_fee);
        
        if amount_out <= 0 { panic!("Output terlalu kecil"); }
        if amount_out < min_token_out { panic!("Slippage terlalu tinggi"); }

        let base_token: Address = env.storage().instance().get(&DataKey::BaseToken).unwrap();
        let client_base = token::Client::new(&env, &base_token);
        let client_in = token::Client::new(&env, &token_in);
        let client_out = token::Client::new(&env, &token_out);
        let platform_wallet: Address = env.storage().instance().get(&DataKey::PlatformWallet).unwrap();

        // 1. Transfer TokenIn from user to contract
        client_in.transfer(&from, &env.current_contract_address(), &token_amount_in);

        // 2. Transfer fee TokenIn to platform
        if fee_in > 0 {
            client_in.transfer(&env.current_contract_address(), &platform_wallet, &fee_in);
        }

        // 3. Transfer fee Base to platform
        if fee_base > 0 {
            client_base.transfer(&env.current_contract_address(), &platform_wallet, &fee_base);
        }

        // 4. Update reserves
        reserve_token_in += amount_in_after_fee;
        reserve_base_in -= base_intermediate;

        reserve_base_out += base_in_after_fee;
        reserve_token_out -= amount_out;

        env.storage().persistent().set(&DataKey::ReserveBase(token_in.clone()), &reserve_base_in);
        env.storage().persistent().set(&DataKey::ReserveToken(token_in.clone()), &reserve_token_in);
        env.storage().persistent().set(&DataKey::ReserveBase(token_out.clone()), &reserve_base_out);
        env.storage().persistent().set(&DataKey::ReserveToken(token_out.clone()), &reserve_token_out);

        // 5. Transfer TokenOut to user
        client_out.transfer(&env.current_contract_address(), &from, &amount_out);

        env.events().publish(
            (Symbol::new(&env, "swap_t2t"), from, token_in, token_out),
            (token_amount_in, amount_out, fee_in, fee_base),
        );
    }

    pub fn get_reserves(env: Env, token: Address) -> (i128, i128) {
        let reserve_base: i128 = env.storage().persistent().get(&DataKey::ReserveBase(token.clone())).unwrap_or(0);
        let reserve_token: i128 = env.storage().persistent().get(&DataKey::ReserveToken(token)).unwrap_or(0);
        (reserve_base, reserve_token)
    }
}
