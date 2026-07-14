import re

with open("contracts/token-swap/src/lib.rs", "r") as f:
    content = f.read()

# Add TokenRegistryAddress to DataKey
content = re.sub(
    r"pub enum DataKey {.*?PlatformFeeBps,",
    r"pub enum DataKey {\n    PlatformWallet,\n    BaseToken,\n    TokenRegistryAddress,\n    PlatformFeeBps,",
    content,
    flags=re.DOTALL
)

# Replace initialize
init_pattern = r"pub fn initialize\(.*?}\n    }"
new_init = """pub fn initialize(env: Env, platform_wallet: Address, base_token: Address, token_registry: Address) {
        if env.storage().instance().has(&DataKey::PlatformWallet) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::PlatformWallet, &platform_wallet);
        env.storage().instance().set(&DataKey::BaseToken, &base_token);
        env.storage().instance().set(&DataKey::TokenRegistryAddress, &token_registry);
        env.storage().instance().set(&DataKey::PlatformFeeBps, &50u32);
    }"""
content = re.sub(init_pattern, new_init, content, flags=re.DOTALL)

# Replace add_token, remove_token, is_listed
remove_funcs_pattern = r"pub fn add_token.*?fn sqrt\(x: i128\) -> i128 {"
new_funcs = """fn is_listed(env: &Env, token: &Address) -> bool {
        let registry: Address = env.storage().instance().get(&DataKey::TokenRegistryAddress).unwrap();
        let res: bool = env.invoke_contract(
            &registry,
            &symbol_short!("is_valid"),
            soroban_sdk::vec![env, token.into_val(env)],
        );
        res
    }

    fn sqrt(x: i128) -> i128 {"""
content = re.sub(remove_funcs_pattern, new_funcs, content, flags=re.DOTALL)

# Add swap_token_for_token
new_swap = """
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
"""

content = content.replace("    pub fn get_reserves(env: Env, token: Address) -> (i128, i128) {", new_swap + "\n    pub fn get_reserves(env: Env, token: Address) -> (i128, i128) {")

with open("contracts/token-swap/src/lib.rs", "w") as f:
    f.write(content)
