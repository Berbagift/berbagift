import re

with open("contracts/nft-gift-locked/src/lib.rs", "r") as f:
    content = f.read()

# Replace DataKey
content = content.replace("PaymentToken1,", "TokenRegistryAddress,")

# Replace initialize
init_pattern = r"pub fn initialize\(env: Env, payment_token1: Address, admin_address: Address\) \{.*?env\.storage\(\)\.instance\(\)\.set\(&DataKey::FeePercentage, &5u32\);\n    \}"
new_init = """pub fn initialize(env: Env, registry_contract: Address, admin_address: Address) {
        if env.storage().instance().has(&DataKey::TokenRegistryAddress) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::TokenRegistryAddress, &registry_contract);
        env.storage().instance().set(&DataKey::AdminAddress, &admin_address);
        env.storage().instance().set(&DataKey::CurrentTokenId, &0u32);
        env.storage().instance().set(&DataKey::MaxBatchSize, &3u32);
        env.storage().instance().set(&DataKey::FeePercentage, &5u32);
    }"""
content = re.sub(init_pattern, new_init, content, flags=re.DOTALL)

# Add is_listed helper
is_listed = """
    fn is_listed(env: &Env, token: &Address) -> bool {
        let registry: Address = env.storage().instance().get(&DataKey::TokenRegistryAddress).unwrap();
        let res: bool = env.invoke_contract(
            &registry,
            &symbol_short!("is_valid"),
            soroban_sdk::vec![env, token.into_val(env)],
        );
        res
    }
"""
content = content.replace("pub fn send_batch_xlm_and_nft(", is_listed + "\n    pub fn send_batch_gift(")

# Replace send_batch_xlm_and_nft
old_send = r"sender: Address,\n        recipients: Vec<Address>,\n        token_amount: i128,\n        is_split: bool,\n        custom_token_uris: Vec<String>,\n        messages: Vec<String>,\n    \) \{"
new_send = r"sender: Address,\n        token: Address,\n        recipients: Vec<Address>,\n        token_amount: i128,\n        is_split: bool,\n        custom_token_uris: Vec<String>,\n        messages: Vec<String>,\n    ) {\n        if !Self::is_listed(&env, &token) { panic!(\"Token tidak terdaftar\"); }"
content = re.sub(old_send, new_send, content)

# Replace Token1 usage in send_batch_gift
content = content.replace("let token1_addr: Address = env.storage().instance().get(&DataKey::PaymentToken1).unwrap();", "")
content = content.replace("let token1_client = token::Client::new(&env, &token1_addr);", "let token_client = token::Client::new(&env, &token);")
content = content.replace("token1_client.transfer", "token_client.transfer")
content = content.replace("token_used: token1_addr.clone()", "token_used: token.clone()")
content = content.replace("token1_addr.clone(), amount_per_user", "token.clone(), amount_per_user")

# Replace send_batch_existing_xlm_and_nft
old_exist = r"pub fn send_batch_existing_xlm_and_nft\(\n        env: Env,\n        sender: Address,\n        recipients: Vec<Address>,\n        token_amount: i128,\n        is_split: bool,\n        token_ids: Vec<u32>,\n        messages: Vec<String>,\n    \) \{"
new_exist = r"pub fn send_batch_existing_gift(\n        env: Env,\n        sender: Address,\n        token: Address,\n        recipients: Vec<Address>,\n        token_amount: i128,\n        is_split: bool,\n        token_ids: Vec<u32>,\n        messages: Vec<String>,\n    ) {\n        if !Self::is_listed(&env, &token) { panic!(\"Token tidak terdaftar\"); }"
content = re.sub(old_exist, new_exist, content)

with open("contracts/nft-gift-locked/src/lib.rs", "w") as f:
    f.write(content)
