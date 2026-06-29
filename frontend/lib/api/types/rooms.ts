export interface Creator {
  username: string;
  initials: string;
  role: string;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  creator: Creator;
  rewardPool: string;
  rewardPoolIdr?: string;
  winners: number;
  joined: number;
  maxParticipants: number;
  participants: string[];
  status: string;
  statusText: string;
  isHighReward: boolean;
  isSaved: boolean;
  claimCountdown?: number | null;
  createdAt?: string | null;
}

export interface RoomActivity {
  id: string;
  roomId: string;
  username: string;
  avatar: string;
  action: 'Joined' | 'Leave';
  timestamp: string;
}
