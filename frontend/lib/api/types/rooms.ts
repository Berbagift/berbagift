export interface Creator {
  username: string;
  initials: string;
  role: string;
}

export interface Participant {
  username: string;
  initials: string;
}

export interface RoomActivity {
  username: string;
  initials: string;
  action: 'joined' | 'left';
  timestamp: string;
}

export interface Room {
  id: string;
  room_id?: number;
  title: string;
  description: string;
  creator: Creator;
  rewardPool: string;
  rewardPoolIdr?: string;
  reward?: string;
  winners: { wallet_address: string; username: string; }[] | number;
  joined: number;
  maxParticipants: number;
  capacity?: number;
  participants: Participant[];
  activities: RoomActivity[];
  status: string;
  statusText: string;
  isHighReward: boolean;
  isSaved: boolean;
  is_joined?: boolean;
  is_owner?: boolean;
  claimCountdown?: number | null;
  claim_session_start?: number | string | null;
  startsAt?: string | null;
  createdAt?: string | null;
}
