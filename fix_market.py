with open("contracts/marketplace/src/lib.rs", "r") as f:
    content = f.read()

content = content.replace(
"""    PaymentToken1, // XLM
    PaymentToken2, // RPK""",
"""    TokenRegistryAddress,""")

content = content.replace(
"""    pub fn initialize(
        env: Env,
        nft_contract: Address,
        payment_token1: Address,
        payment_token2: Address,
    ) {
        if env.storage().instance().has(&DataKey::NftContract) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::NftContract, &nft_contract);
        env.storage().instance().set(&DataKey::PaymentToken1, &payment_token1);
        env.storage().instance().set(&DataKey::PaymentToken2, &payment_token2);
    }""",
"""    pub fn initialize(
        env: Env,
        nft_contract: Address,
        registry_contract: Address,
    ) {
        if env.storage().instance().has(&DataKey::NftContract) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::NftContract, &nft_contract);
        env.storage().instance().set(&DataKey::TokenRegistryAddress, &registry_contract);
    }

    fn is_listed(env: &Env, token: &Address) -> bool {
        let registry: Address = env.storage().instance().get(&DataKey::TokenRegistryAddress).unwrap();
        let res: bool = env.invoke_contract(
            &registry,
            &symbol_short!("is_valid"),
            soroban_sdk::vec![env, token.clone().into_val(env)],
        );
        res
    }"""
)

old_list_item = """        let token1: Address = env.storage().instance().get(&DataKey::PaymentToken1).unwrap();
        let token2: Address = env.storage().instance().get(&DataKey::PaymentToken2).unwrap();
        
        if payment_token != token1 && payment_token != token2 {
            panic!("Hanya menerima pembayaran XLM atau RPK");
        }"""
new_list_item = """        if !Self::is_listed(&env, &payment_token) {
            panic!("Token tidak terdaftar");
        }"""
content = content.replace(old_list_item, new_list_item)


# Fix tests
import re

test_mod = """#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Address, Env, String};
    use soroban_sdk::token::Client as TokenClient;
    use soroban_sdk::token::StellarAssetClient as TokenAdminClient;
    
    use nft_gift_locked::{BundleBatchTransferContractClient};

    fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, TokenAdminClient<'a>) {
        let contract_id = env.register_stellar_asset_contract_v2(admin.clone());
        (
            TokenClient::new(env, &contract_id.address()),
            TokenAdminClient::new(env, &contract_id.address()),
        )
    }

    #[contract]
    pub struct DummyRegistry;
    #[contractimpl]
    impl DummyRegistry {
        pub fn is_valid(env: Env, token: Address) -> bool { true }
    }

    #[test]
    fn test_marketplace_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let seller = Address::generate(&env);
        let buyer = Address::generate(&env);

        let (xlm, xlm_admin) = create_token(&env, &admin);

        xlm_admin.mint(&seller, &1000);
        xlm_admin.mint(&buyer, &5000);

        let registry_id = env.register(DummyRegistry, ());

        let nft_contract_id = env.register(nft_gift_locked::BundleBatchTransferContract, ());
        let nft_client = BundleBatchTransferContractClient::new(&env, &nft_contract_id);
        nft_client.initialize(&registry_id, &admin);

        let market_contract_id = env.register(LockedNFTMarketplace, ());
        let market_client = LockedNFTMarketplaceClient::new(&env, &market_contract_id);
        market_client.initialize(&nft_contract_id, &registry_id);

        nft_client.set_marketplace_address(&admin, &market_contract_id);

        let recipients = vec![&env, seller.clone()];
        let token_amounts = vec![&env, 100i128];
        let uris = vec![&env, String::from_str(&env, "ipfs://secret")];
        let messages = vec![&env, String::from_str(&env, "Hello")];
        nft_client.send_batch_gift(&seller, &xlm.address, &recipients, &token_amounts, &uris, &messages);

        let token_id = 1;
        assert_eq!(nft_client.owner_of(&token_id), seller);

        market_client.list_item(&seller, &token_id, &xlm.address, &500i128);

        let listing = market_client.get_listing_detail(&token_id);
        assert_eq!(listing.seller, seller);
        assert_eq!(listing.price, 500);
        assert!(listing.is_active);

        let seller_balance_before = xlm.balance(&seller);

        market_client.buy_item(&buyer, &token_id);

        assert_eq!(xlm.balance(&seller), seller_balance_before + 500);
        assert_eq!(nft_client.owner_of(&token_id), buyer);
        assert_eq!(nft_client.token_uri(&token_id), String::from_str(&env, "ipfs://default-opened-gift"));

        let post_listing = market_client.get_listing_detail(&token_id);
        assert!(!post_listing.is_active);
    }
}"""
content = re.sub(r"#\[cfg\(test\)\].*", test_mod, content, flags=re.DOTALL)

with open("contracts/marketplace/src/lib.rs", "w") as f:
    f.write(content)
