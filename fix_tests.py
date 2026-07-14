import re

with open("contracts/nft-gift-locked/src/lib.rs", "r") as f:
    content = f.read()

test_mod = """#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Address, Env, String};
    use soroban_sdk::token::Client as TokenClient;
    use soroban_sdk::token::StellarAssetClient as TokenAdminClient;

    fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, TokenAdminClient<'a>) {
        let contract_id = env.register_stellar_asset_contract_v2(admin.clone());
        (
            TokenClient::new(env, &contract_id.address()),
            TokenAdminClient::new(env, &contract_id.address()),
        )
    }

    // Dummy TokenRegistry implementation for tests
    #[contract]
    pub struct DummyRegistry;
    #[contractimpl]
    impl DummyRegistry {
        pub fn is_valid(env: Env, token: Address) -> bool { true }
    }

    #[test]
    fn test_batch_transfer_xlm_and_rpk() {
        let env = Env::default();
        env.mock_all_auths();

        let sender = Address::generate(&env);
        let recipient1 = Address::generate(&env);
        let recipient2 = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let (token1, token1_admin) = create_token(&env, &token_admin);
        let (token2, token2_admin) = create_token(&env, &token_admin);
        token1_admin.mint(&sender, &1000);
        token2_admin.mint(&sender, &1000);

        let registry_id = env.register(DummyRegistry, ());

        let contract_id = env.register(BundleBatchTransferContract, ());
        let client = BundleBatchTransferContractClient::new(&env, &contract_id);

        let admin_wallet = Address::generate(&env);
        client.initialize(&registry_id, &admin_wallet);

        // Test Token1
        let recipients_xlm = vec![&env, recipient1.clone()];
        let token_amounts_xlm = vec![&env, 100i128];
        let uris_xlm = vec![&env, String::from_str(&env, "ipfs://abc")];
        let messages_xlm = vec![&env, String::from_str(&env, "Selamat hari raya!")];

        client.send_batch_gift(&sender, &token1.address, &recipients_xlm, &token_amounts_xlm, &uris_xlm, &messages_xlm);

        assert_eq!(token1.balance(&sender), 900);
        assert_eq!(token1.balance(&recipient1), 100);
        assert_eq!(token1.balance(&admin_wallet), 0);

        // Test Token2
        let recipients_rpk = vec![&env, recipient2.clone()];
        let token_amounts_rpk = vec![&env, 200i128];
        let uris_rpk = vec![&env, String::from_str(&env, "ipfs://def")];
        let messages_rpk = vec![&env, String::from_str(&env, "Semoga sukses!")];

        client.send_batch_gift(&sender, &token2.address, &recipients_rpk, &token_amounts_rpk, &uris_rpk, &messages_rpk);

        assert_eq!(token2.balance(&sender), 799);
        assert_eq!(token2.balance(&recipient2), 200);
        assert_eq!(token2.balance(&admin_wallet), 1);
    }
}"""

content = re.sub(r"#\[cfg\(test\)\].*", test_mod, content, flags=re.DOTALL)

with open("contracts/nft-gift-locked/src/lib.rs", "w") as f:
    f.write(content)
