#![no_std]
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
    PaymentToken1,
    PaymentToken2,
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
    pub fn initialize(env: Env, payment_token1: Address, payment_token2: Address, admin_address: Address) {
        if env.storage().instance().has(&DataKey::PaymentToken1) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::PaymentToken1, &payment_token1);
        env.storage().instance().set(&DataKey::PaymentToken2, &payment_token2);
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
    pub fn send_batch_xlm_and_nft(
        env: Env,
        sender: Address,
        recipients: Vec<Address>,
        token_amounts: Vec<i128>,
        custom_token_uris: Vec<String>,
        messages: Vec<String>, // Custom messages for each recipient
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

        let token1_addr: Address = env.storage().instance().get(&DataKey::PaymentToken1).unwrap();
        let token1_client = token::Client::new(&env, &token1_addr);

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

            token1_client.transfer(&sender, &recipient, &token_amount);

            let fee = (token_amount * 5) / 1000; // 0.5%
            if fee > 0 {
                token1_client.transfer(&sender, &admin_addr, &fee);
            }

            current_token_id += 1;
            let new_item_id = current_token_id;

            let nft_data = NFTData {
                recipient: recipient.clone(),
                token_used: token1_addr.clone(),
                token_amount,
            };
            env.storage().persistent().set(&DataKey::NftData(new_item_id), &nft_data);
            env.storage().persistent().set(&DataKey::Owner(new_item_id), &recipient);
            env.storage().persistent().set(&DataKey::TokenUri(new_item_id), &custom_token_uri);

            env.events().publish(
                (symbol_short!("BndlSent"), sender.clone(), recipient.clone(), new_item_id),
                (token1_addr.clone(), token_amount, custom_token_uri, user_message),
            );
        }

        env.storage().instance().set(&DataKey::CurrentTokenId, &current_token_id);
    }

    /// Khusus mengirim RPK (PaymentToken2) dan me-mint NFT. Max 3 users.
    pub fn send_batch_rpk_and_nft(
        env: Env,
        sender: Address,
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

        let token2_addr: Address = env.storage().instance().get(&DataKey::PaymentToken2).unwrap();
        let token2_client = token::Client::new(&env, &token2_addr);

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

            token2_client.transfer(&sender, &recipient, &token_amount);

            let fee = (token_amount * 5) / 1000; // 0.5%
            if fee > 0 {
                token2_client.transfer(&sender, &admin_addr, &fee);
            }

            current_token_id += 1;
            let new_item_id = current_token_id;

            let nft_data = NFTData {
                recipient: recipient.clone(),
                token_used: token2_addr.clone(),
                token_amount,
            };
            env.storage().persistent().set(&DataKey::NftData(new_item_id), &nft_data);
            env.storage().persistent().set(&DataKey::Owner(new_item_id), &recipient);
            env.storage().persistent().set(&DataKey::TokenUri(new_item_id), &custom_token_uri);

            env.events().publish(
                (symbol_short!("BndlSent"), sender.clone(), recipient.clone(), new_item_id),
                (token2_addr.clone(), token_amount, custom_token_uri, user_message),
            );
        }

        env.storage().instance().set(&DataKey::CurrentTokenId, &current_token_id);
    }

    pub fn send_batch_existing_xlm_and_nft(
        env: Env,
        sender: Address,
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

        let token1_addr: Address = env.storage().instance().get(&DataKey::PaymentToken1).unwrap();
        let token1_client = token::Client::new(&env, &token1_addr);
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

            // 1. Transfer XLM
            token1_client.transfer(&sender, &recipient, &token_amount);
            let fee = (token_amount * 5) / 1000;
            if fee > 0 { token1_client.transfer(&sender, &admin_addr, &fee); }

            // 2. Transfer NFT
            env.storage().persistent().set(&DataKey::Owner(token_id), &recipient);

            // 3. Update NftData
            let nft_data = NFTData {
                recipient: recipient.clone(),
                token_used: token1_addr.clone(),
                token_amount,
            };
            env.storage().persistent().set(&DataKey::NftData(token_id), &nft_data);

            let token_uri: String = env.storage().persistent().get(&DataKey::TokenUri(token_id)).unwrap();

            env.events().publish(
                (symbol_short!("BndlSent"), sender.clone(), recipient.clone(), token_id),
                (token1_addr.clone(), token_amount, token_uri, user_message),
            );
        }
    }

    pub fn send_batch_existing_rpk_and_nft(
        env: Env,
        sender: Address,
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

        let token2_addr: Address = env.storage().instance().get(&DataKey::PaymentToken2).unwrap();
        let token2_client = token::Client::new(&env, &token2_addr);
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

            // 1. Transfer RPK
            token2_client.transfer(&sender, &recipient, &token_amount);
            let fee = (token_amount * 5) / 1000;
            if fee > 0 { token2_client.transfer(&sender, &admin_addr, &fee); }

            // 2. Transfer NFT
            env.storage().persistent().set(&DataKey::Owner(token_id), &recipient);

            // 3. Update NftData
            let nft_data = NFTData {
                recipient: recipient.clone(),
                token_used: token2_addr.clone(),
                token_amount,
            };
            env.storage().persistent().set(&DataKey::NftData(token_id), &nft_data);

            let token_uri: String = env.storage().persistent().get(&DataKey::TokenUri(token_id)).unwrap();

            env.events().publish(
                (symbol_short!("BndlSent"), sender.clone(), recipient.clone(), token_id),
                (token2_addr.clone(), token_amount, token_uri, user_message),
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

        let contract_id = env.register(BundleBatchTransferContract, ());
        let client = BundleBatchTransferContractClient::new(&env, &contract_id);

        let admin_wallet = Address::generate(&env);
        client.initialize(&token1.address, &token2.address, &admin_wallet);

        // Test XLM
        let recipients_xlm = vec![&env, recipient1.clone()];
        let token_amounts_xlm = vec![&env, 100i128];
        let uris_xlm = vec![&env, String::from_str(&env, "ipfs://abc")];
        let messages_xlm = vec![&env, String::from_str(&env, "Selamat hari raya!")];

        client.send_batch_xlm_and_nft(&sender, &recipients_xlm, &token_amounts_xlm, &uris_xlm, &messages_xlm);

        assert_eq!(token1.balance(&sender), 900); // 1000 - 100 - 0 (0.5% of 100 is 0.5 -> 0)
        assert_eq!(token1.balance(&recipient1), 100);
        assert_eq!(token1.balance(&admin_wallet), 0); // fee is 0 because integer division of 500/1000 = 0

        // Test RPK
        let recipients_rpk = vec![&env, recipient2.clone()];
        let token_amounts_rpk = vec![&env, 200i128];
        let uris_rpk = vec![&env, String::from_str(&env, "ipfs://def")];
        let messages_rpk = vec![&env, String::from_str(&env, "Semoga sukses!")];

        client.send_batch_rpk_and_nft(&sender, &recipients_rpk, &token_amounts_rpk, &uris_rpk, &messages_rpk);

        assert_eq!(token2.balance(&sender), 799); // 1000 - 200 - 1 (0.5% of 200 = 1)
        assert_eq!(token2.balance(&recipient2), 200);
        assert_eq!(token2.balance(&admin_wallet), 1);

        let nft_data1 = client.get_nft_data(&1);
        assert_eq!(nft_data1.recipient, recipient1);
        assert_eq!(nft_data1.token_used, token1.address);
        assert_eq!(nft_data1.token_amount, 100);
    }

    #[test]
    fn test_transfer_resets_metadata() {
        let env = Env::default();
        env.mock_all_auths();

        let sender = Address::generate(&env);
        let recipient1 = Address::generate(&env);
        let buyer = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let (token1, token1_admin) = create_token(&env, &token_admin);
        let (token2, _token2_admin) = create_token(&env, &token_admin);
        token1_admin.mint(&sender, &1000);

        let contract_id = env.register(BundleBatchTransferContract, ());
        let client = BundleBatchTransferContractClient::new(&env, &contract_id);

        let admin_wallet = Address::generate(&env);
        client.initialize(&token1.address, &token2.address, &admin_wallet);

        // Mint NFT
        let recipients = vec![&env, recipient1.clone()];
        let token_amounts = vec![&env, 100i128];
        let uris = vec![&env, String::from_str(&env, "ipfs://personal-metadata")];
        let messages = vec![&env, String::from_str(&env, "Private Message")];

        client.send_batch_xlm_and_nft(&sender, &recipients, &token_amounts, &uris, &messages);

        let token_id = 1;
        assert_eq!(client.owner_of(&token_id), recipient1);
        assert_eq!(client.token_uri(&token_id), String::from_str(&env, "ipfs://personal-metadata"));

        // Verifikasi transfer langsung gagal jika bukan dari marketplace
        // Tapi transfer_by_marketplace butuh auth dari marketplace, mari kita set dulu
        client.set_marketplace_address(&admin_wallet, &buyer);
        
        // Simulasikan marketplace mentransfer NFT
        client.transfer(&recipient1, &buyer, &token_id);

        // Verify Owner changed
        assert_eq!(client.owner_of(&token_id), buyer);

        // Verify metadata was reset
        assert_eq!(client.token_uri(&token_id), String::from_str(&env, "ipfs://default-opened-gift"));
    }

    #[test]
    fn test_send_batch_existing() {
        let env = Env::default();
        env.mock_all_auths();

        let sender = Address::generate(&env);
        let recipient1 = Address::generate(&env);
        let recipient2 = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let (token1, token1_admin) = create_token(&env, &token_admin);
        let (token2, _token2_admin) = create_token(&env, &token_admin);
        token1_admin.mint(&sender, &1000);
        token1_admin.mint(&recipient1, &1000); // For forwarding

        let contract_id = env.register(BundleBatchTransferContract, ());
        let client = BundleBatchTransferContractClient::new(&env, &contract_id);

        let admin_wallet = Address::generate(&env);
        client.initialize(&token1.address, &token2.address, &admin_wallet);

        // Mint NFT
        let recipients = vec![&env, recipient1.clone()];
        let token_amounts = vec![&env, 100i128];
        let uris = vec![&env, String::from_str(&env, "ipfs://personal-metadata")];
        let messages = vec![&env, String::from_str(&env, "Private Message")];

        client.send_batch_xlm_and_nft(&sender, &recipients, &token_amounts, &uris, &messages);

        let token_id = 1;
        assert_eq!(client.owner_of(&token_id), recipient1);
        
        // Forward NFT
        let forward_recipients = vec![&env, recipient2.clone()];
        let forward_token_ids = vec![&env, token_id];
        let forward_amounts = vec![&env, 200i128];
        let forward_messages = vec![&env, String::from_str(&env, "Forwarded Message")];

        client.send_batch_existing_xlm_and_nft(
            &recipient1,
            &forward_recipients,
            &forward_token_ids,
            &forward_amounts,
            &forward_messages
        );

        assert_eq!(client.owner_of(&token_id), recipient2);
        // URI should NOT reset
        assert_eq!(client.token_uri(&token_id), String::from_str(&env, "ipfs://personal-metadata"));
        // Token amount should be updated in NFTData
        let nft_data = client.get_nft_data(&token_id);
        assert_eq!(nft_data.recipient, recipient2);
        assert_eq!(nft_data.token_amount, 200);
    }
}
