from models.mongo_room import Room, RoomParticipant

class RoomDatabase:
    @staticmethod
    def upsert_room(data: dict):
        tx_hash = data.get("transaction_hash")
        if tx_hash:
            room = Room.objects(transaction_hash=tx_hash).first()
        else:
            room_id = data.get("room_id")
            room = Room.objects(room_id=room_id).first()
            
        if not room:
            room = Room(**data)
        else:
            for k, v in data.items():
                setattr(room, k, v)
        room.save()
        return room

    @staticmethod
    def upsert_participant(room_id: int, wallet_address: str):
        participant = RoomParticipant.objects(room_id=room_id, wallet_address=wallet_address).first()
        if not participant:
            participant = RoomParticipant(room_id=room_id, wallet_address=wallet_address)
        participant.is_joined = True
        participant.save()
        return participant

    @staticmethod
    def is_participant(room_id: int, wallet_address: str) -> bool:
        participant = RoomParticipant.objects(room_id=room_id, wallet_address=wallet_address, is_joined=True).first()
        return participant is not None

    @staticmethod
    def set_participant_left(room_id: int, wallet_address: str):
        participant = RoomParticipant.objects(room_id=room_id, wallet_address=wallet_address).first()
        if participant:
            participant.is_joined = False
            participant.save()
        return participant

    @staticmethod
    def set_participant_claimed(room_id: int, wallet_address: str):
        participant = RoomParticipant.objects(room_id=room_id, wallet_address=wallet_address).first()
        if participant:
            participant.is_claimed = True
            participant.save()
        return participant

    @staticmethod
    def get_participants(room_id: int):
        participants = RoomParticipant.objects(room_id=room_id, is_joined=True).order_by("-created_at")
        return [p.to_dict() for p in participants]

    @staticmethod
    def get_rooms_by_owner(wallet_address: str, limit: int = 50):
        rooms = Room.objects(owner=wallet_address).order_by("-room_id").limit(limit)
        return [room.to_dict() for room in rooms]

    @staticmethod
    def get_explore_rooms(wallet_address: str = None, limit: int = 50):
        if wallet_address:
            rooms = Room.objects(owner__ne=wallet_address).order_by("-room_id").limit(limit)
        else:
            rooms = Room.objects().order_by("-room_id").limit(limit)
        return [room.to_dict() for room in rooms]

    @staticmethod
    def get_room_by_id(identifier: str):
        try:
            from bson import ObjectId
            import bson.errors
            try:
                obj_id = ObjectId(identifier)
                room = Room.objects(id=obj_id).first()
                if room:
                    return room.to_dict()
            except bson.errors.InvalidId:
                pass
                
            try:
                room_id_int = int(identifier)
                room = Room.objects(room_id=room_id_int).first()
                if room:
                    return room.to_dict()
            except ValueError:
                pass

            # Try by transaction hash
            room = Room.objects(transaction_hash=identifier).first()
            if room:
                return room.to_dict()
        except Exception:
            pass
        return None
