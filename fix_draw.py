with open("contracts/multi-room-auto-draw/src/lib.rs", "r") as f:
    content = f.read()

# Replace DataKey
content = content.replace("    NativeToken,\n}", "    TokenRegistryAddress,\n}")

# Replace initialize
content = content.replace(
"""    pub fn initialize(env: Env, platform_wallet: Address, native_token: Address) {
        if env.storage().instance().has(&DataKey::PlatformWallet) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::PlatformWallet, &platform_wallet);
        env.storage().instance().set(&DataKey::NativeToken, &native_token);
        env.storage().instance().set(&DataKey::PlatformFeeBps, &50i128);
    }""",
"""    pub fn initialize(env: Env, platform_wallet: Address, token_registry: Address) {
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
    }"""
)

# Update create_room signature
content = content.replace(
"""    pub fn create_room(
        env: Env,
        admin: Address,
        title: String,
        description: String,
        capacity: u32,
        total_winners: u32,
        claim_session_start: u64,
        total_reward: i128,
    ) -> u32 {""",
"""    pub fn create_room(
        env: Env,
        admin: Address,
        token_address: Address,
        title: String,
        description: String,
        capacity: u32,
        total_winners: u32,
        claim_session_start: u64,
        total_reward: i128,
    ) -> u32 {""")

# Update token validation inside create_room
content = content.replace(
"""        let token_address: Address = env.storage().instance().get(&DataKey::NativeToken).unwrap();
        let token_client = token::Client::new(&env, &token_address);""",
"""        if !Self::is_listed(&env, &token_address) {
            panic!("Token tidak terdaftar");
        }
        let token_client = token::Client::new(&env, &token_address);""")

with open("contracts/multi-room-auto-draw/src/lib.rs", "w") as f:
    f.write(content)
