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
  title: string;
  description: string;
  creator: Creator;
  rewardPool: string;
  rewardPoolIdr?: string;
  winners: number;
  joined: number;
  maxParticipants: number;
  participants: Participant[];
  activities: RoomActivity[];
  status: string;
  statusText: string;
  isHighReward: boolean;
  isSaved: boolean;
  claimCountdown?: number | null;
  startsAt?: string | null;
  createdAt?: string | null;
}
