#![no_std]
#![allow(deprecated)]
#![allow(unused_imports)]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol, IntoVal,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ListingData {
    pub seller: Address,
    pub payment_token: Address,
    pub price: i128,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    NftContract,
    TokenRegistryAddress,
    Listing(u32),  // token_id -> ListingData
}

// Define the interface of the NFT contract we want to call
// We can use a trait to generate a client, or just use env.invoke_contract.
// Let's use env.invoke_contract to avoid complex dependencies, 
// since we only need `owner_of` and `transfer`.

#[contract]
pub struct LockedNFTMarketplace;

#[contractimpl]
impl LockedNFTMarketplace {
    pub fn initialize(
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
    }

    pub fn list_item(
        env: Env,
        seller: Address,
        token_id: u32,
        payment_token: Address,
        price: i128,
    ) {
        seller.require_auth();

        if price <= 0 {
            panic!("Harga harus > 0");
        }

        if !Self::is_listed(&env, &payment_token) {
            panic!("Token tidak terdaftar");
        }

        let nft_contract: Address = env.storage().instance().get(&DataKey::NftContract).unwrap();

        // Check if seller is the owner using env.invoke_contract
        let owner: Address = env.invoke_contract(
            &nft_contract,
            &symbol_short!("owner_of"),
            soroban_sdk::vec![&env, token_id.into_val(&env)],
        );

        if owner != seller {
            panic!("Anda bukan pemilik NFT ini");
        }

        // Pastikan NFT berasal dari sendgift (dengan mencoba mengambil NftData)
        // Jika token_id tidak ada, pemanggilan ini akan otomatis panic
        let _nft_data: soroban_sdk::Val = env.invoke_contract(
            &nft_contract,
            &Symbol::new(&env, "get_nft_data"),
            soroban_sdk::vec![&env, token_id.into_val(&env)],
        );

        let listing = ListingData {
            seller: seller.clone(),
            payment_token: payment_token.clone(),
            price,
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::Listing(token_id), &listing);

        env.events().publish(
            (symbol_short!("Listed"), seller, token_id),
            (payment_token, price),
        );
    }

    pub fn buy_item(env: Env, buyer: Address, token_id: u32) {
        buyer.require_auth();

        let mut listing: ListingData = env.storage().persistent().get(&DataKey::Listing(token_id))
            .unwrap_or_else(|| panic!("Listing tidak ditemukan"));

        if !listing.is_active {
            panic!("NFT ini tidak sedang dijual");
        }
        if listing.seller == buyer {
            panic!("Tidak bisa membeli NFT sendiri");
        }

        // 1. Tandai listing tidak aktif (CEI)
        listing.is_active = false;
        env.storage().persistent().set(&DataKey::Listing(token_id), &listing);

        // 2. Proses Pembayaran
        let token_client = token::Client::new(&env, &listing.payment_token);
        token_client.transfer(&buyer, &listing.seller, &listing.price);

        // 3. Proses Transfer NFT
        let nft_contract: Address = env.storage().instance().get(&DataKey::NftContract).unwrap();
        
        // Memanggil fungsi `transfer` di kontrak NFT-locked yang mensyaratkan auth dari marketplace.
        // Karena kita sedang berada di eksekusi marketplace ini, `env.invoke_contract` 
        // akan menggunakan otorisasi dari kontrak ini secara otomatis.
        let _res: () = env.invoke_contract(
            &nft_contract,
            &Symbol::new(&env, "transfer"),
            soroban_sdk::vec![&env, listing.seller.clone().into_val(&env), buyer.clone().into_val(&env), token_id.into_val(&env)],
        );

        env.events().publish(
            (symbol_short!("Sold"), buyer, listing.seller, token_id),
            (listing.payment_token, listing.price),
        );
    }

    pub fn cancel_listing(env: Env, seller: Address, token_id: u32) {
        seller.require_auth();

        let mut listing: ListingData = env.storage().persistent().get(&DataKey::Listing(token_id))
            .unwrap_or_else(|| panic!("Listing tidak ditemukan"));

        if !listing.is_active {
            panic!("NFT ini tidak sedang dijual");
        }
        if listing.seller != seller {
            panic!("Hanya penjual yang bisa membatalkan");
        }

        listing.is_active = false;
        env.storage().persistent().set(&DataKey::Listing(token_id), &listing);

        env.events().publish(
            (symbol_short!("Canceled"), seller, token_id),
            (),
        );
    }

    pub fn get_listing_detail(env: Env, token_id: u32) -> ListingData {
        env.storage().persistent().get(&DataKey::Listing(token_id)).unwrap()
    }

    pub fn get_seller(env: Env, token_id: u32) -> Address {
        let listing: ListingData = env.storage().persistent().get(&DataKey::Listing(token_id)).unwrap();
        listing.seller
    }
}

#[cfg(test)]
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
}