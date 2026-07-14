from models.mongo_nft import NFT

class NFTDatabase:
    @staticmethod
    def upsert_nft(data: dict):
        token_id = data.get("token_id")
        nft = NFT.objects(token_id=token_id).first()
        if not nft:
            nft = NFT(**data)
        else:
            for k, v in data.items():
                setattr(nft, k, v)
        nft.save()
        return nft

    @staticmethod
    def get_user_nfts(wallet_address: str, limit: int = 50):
        nfts = NFT.objects(owner_address=wallet_address).order_by("-datetime").limit(limit)
        return [nft.to_dict() for nft in nfts]

    @staticmethod
    def update_owner(token_id: int, new_owner: str, default_uri: str = None):
        nft = NFT.objects(token_id=token_id).first()
        if nft:
            nft.owner_address = new_owner
            if default_uri:
                nft.token_uri = default_uri
            nft.save()
            return True
        return False

    @staticmethod
    def set_listing_status(token_id: int, is_listed: bool, price: str = None):
        nft = NFT.objects(token_id=token_id).first()
        if nft:
            nft.is_listed = is_listed
            if price is not None:
                nft.price = price
            elif not is_listed:
                nft.price = None
            nft.save()
            return True
        return False

    @staticmethod
    def get_listed_nfts(limit: int = 50):
        nfts = NFT.objects(is_listed=True).order_by("-datetime").limit(limit)
        return [nft.to_dict() for nft in nfts]
