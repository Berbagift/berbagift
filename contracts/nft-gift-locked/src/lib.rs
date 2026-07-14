#![no_std]
#![allow(deprecated)]
#![allow(unused_imports)]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTData {
    pub recipient: Address,
    pub token_used: Address,
    pub token_amount: i128,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    TokenRegistryAddress,
    AdminAddress,
    CurrentTokenId,
    NftData(u32),
    TokenUri(u32),
    Owner(u32),
    MarketplaceAddress,
}

const MAX_BATCH_SIZE: u32 = 3;

#[contract]
pub struct BundleBatchTransferContract;

#[contractimpl]
impl BundleBatchTransferContract {
    /// Initializes the contract with two payment token options and an admin fee address.
    pub fn initialize(env: Env, registry_contract: Address, admin_address: Address) {
        if env.storage().instance().has(&DataKey::TokenRegistryAddress) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::TokenRegistryAddress, &registry_contract);
        env.storage().instance().set(&DataKey::AdminAddress, &admin_address);
        env.storage().instance().set(&DataKey::CurrentTokenId, &0u32);
    }

    pub fn set_marketplace_address(env: Env, admin: Address, marketplace: Address) {
        admin.require_auth();
        let current_admin: Address = env.storage().instance().get(&DataKey::AdminAddress).unwrap();
        if admin != current_admin {
            panic!("Hanya admin yang bisa mengatur marketplace");
        }
        env.storage().instance().set(&DataKey::MarketplaceAddress, &marketplace);
    }

    /// Sends ERC-20 equivalent tokens (based on choice), mints NFTs, and broadcasts a custom message.
    /// Max 3 users per transaction.
    fn is_listed(env: &Env, token: &Address) -> bool {
        use soroban_sdk::IntoVal;
        let registry: Address = env.storage().instance().get(&DataKey::TokenRegistryAddress).unwrap();
        let res: bool = env.invoke_contract(
            &registry,
            &symbol_short!("is_valid"),
            soroban_sdk::vec![env, token.into_val(env)],
        );
        res
    }

    pub fn send_batch_gift(
        env: Env,
        sender: Address,
        token: Address,
        recipients: Vec<Address>,
        token_amounts: Vec<i128>,
        custom_token_uris: Vec<String>,
        messages: Vec<String>,
    ) {
        sender.require_auth();

        let total_recipients = recipients.len();

        if total_recipients == 0 {
            panic!("Daftar penerima tidak boleh kosong");
        }
        if total_recipients > MAX_BATCH_SIZE {
            panic!("Maksimal hanya bisa mengirim ke 3 user sekaligus");
        }
        if total_recipients != token_amounts.len() || 
           total_recipients != custom_token_uris.len() ||
           total_recipients != messages.len() {
            panic!("Panjang array alamat, token, URI, dan pesan harus sama persis");
        }

        if !Self::is_listed(&env, &token) {
            panic!("Token tidak terdaftar");
        }
        let token_client = token::Client::new(&env, &token);

        let admin_addr: Address = env.storage().instance().get(&DataKey::AdminAddress).unwrap();

        let mut current_token_id: u32 = env.storage().instance().get(&DataKey::CurrentTokenId).unwrap();

        for i in 0..total_recipients {
            let recipient = recipients.get(i).unwrap();
            let token_amount = token_amounts.get(i).unwrap();
            let custom_token_uri = custom_token_uris.get(i).unwrap();
            let user_message = messages.get(i).unwrap();

            if token_amount <= 0 {
                panic!("Jumlah token harus lebih dari 0");
            }

            token_client.transfer(&sender, &recipient, &token_amount);

            let fee = (token_amount * 5) / 1000; // 0.5%
            if fee > 0 {
                token_client.transfer(&sender, &admin_addr, &fee);
            }

            current_token_id += 1;
            let new_item_id = current_token_id;

            let nft_data = NFTData {
                recipient: recipient.clone(),
                token_used: token.clone(),
                token_amount,
            };
            env.storage().persistent().set(&DataKey::NftData(new_item_id), &nft_data);
            env.storage().persistent().set(&DataKey::Owner(new_item_id), &recipient);
            env.storage().persistent().set(&DataKey::TokenUri(new_item_id), &custom_token_uri);

            env.events().publish(
                (symbol_short!("BndlSent"), sender.clone(), recipient.clone(), new_item_id),
                (token.clone(), token_amount, custom_token_uri, user_message),
            );
        }

        env.storage().instance().set(&DataKey::CurrentTokenId, &current_token_id);
    }

    pub fn send_batch_existing_gift(
        env: Env,
        sender: Address,
        token: Address,
        recipients: Vec<Address>,
        token_ids: Vec<u32>,
        token_amounts: Vec<i128>,
        messages: Vec<String>,
    ) {
        sender.require_auth();
        let total_recipients = recipients.len();

        if total_recipients == 0 || total_recipients > MAX_BATCH_SIZE {
            panic!("Jumlah penerima tidak valid (1-3)");
        }
        if total_recipients != token_ids.len() || total_recipients != token_amounts.len() || total_recipients != messages.len() {
            panic!("Panjang array tidak sama persis");
        }

        if !Self::is_listed(&env, &token) {
            panic!("Token tidak terdaftar");
        }
        let token_client = token::Client::new(&env, &token);
        let admin_addr: Address = env.storage().instance().get(&DataKey::AdminAddress).unwrap();

        for i in 0..total_recipients {
            let recipient = recipients.get(i).unwrap();
            let token_id = token_ids.get(i).unwrap();
            let token_amount = token_amounts.get(i).unwrap();
            let user_message = messages.get(i).unwrap();

            if token_amount <= 0 { panic!("Jumlah token harus > 0"); }

            let current_owner: Address = env.storage().persistent().get(&DataKey::Owner(token_id)).unwrap();
            if current_owner != sender {
                panic!("Bukan pemilik NFT");
            }

            token_client.transfer(&sender, &recipient, &token_amount);
            let fee = (token_amount * 5) / 1000;
            if fee > 0 { token_client.transfer(&sender, &admin_addr, &fee); }

            env.storage().persistent().set(&DataKey::Owner(token_id), &recipient);

            let nft_data = NFTData {
                recipient: recipient.clone(),
                token_used: token.clone(),
                token_amount,
            };
            env.storage().persistent().set(&DataKey::NftData(token_id), &nft_data);

            let token_uri: String = env.storage().persistent().get(&DataKey::TokenUri(token_id)).unwrap();

            env.events().publish(
                (symbol_short!("BndlSent"), sender.clone(), recipient.clone(), token_id),
                (token.clone(), token_amount, token_uri, user_message),
            );
        }
    }



    pub fn get_nft_data(env: Env, token_id: u32) -> NFTData {
        env.storage().persistent().get(&DataKey::NftData(token_id)).unwrap()
    }

    pub fn owner_of(env: Env, token_id: u32) -> Address {
        env.storage().persistent().get(&DataKey::Owner(token_id)).unwrap()
    }

    pub fn token_uri(env: Env, token_id: u32) -> String {
        env.storage().persistent().get(&DataKey::TokenUri(token_id)).unwrap()
    }

    /// Mentransfer NFT via Marketplace
    pub fn transfer(env: Env, from: Address, to: Address, token_id: u32) {
        // Hanya marketplace yang bisa melakukan transfer reguler ini
        let marketplace: Address = env.storage().instance().get(&DataKey::MarketplaceAddress)
            .unwrap_or_else(|| panic!("Marketplace belum diset"));
        marketplace.require_auth();

        let current_owner: Address = env.storage().persistent().get(&DataKey::Owner(token_id)).unwrap();
        if current_owner != from {
            panic!("Bukan pemilik NFT");
        }

        // Update owner
        env.storage().persistent().set(&DataKey::Owner(token_id), &to);

        // Timpa token URI menjadi default (metadata personal dihapus)
        let default_uri = String::from_str(&env, "ipfs://default-opened-gift");
        env.storage().persistent().set(&DataKey::TokenUri(token_id), &default_uri);

        env.events().publish(
            (symbol_short!("Transfer"), from, to, token_id),
            default_uri,
        );
    }

    pub fn name(env: Env) -> String {
        String::from_str(&env, "BagiTHR")
    }

    pub fn symbol(env: Env) -> String {
        String::from_str(&env, "BTHR")
    }
}

#[cfg(test)]
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
}