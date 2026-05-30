import roomsData from '../mockapi/rooms.json';

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
  winners: number;
  joined: number;
  maxParticipants: number;
  participants: string[];
  status: string;
  statusText: string;
  isHighReward: boolean;
  isSaved: boolean;
}

export const roomService = {
  getRooms: async (): Promise<Room[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return roomsData as Room[];
  },

  searchRooms: async (query: string): Promise<Room[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return (roomsData as Room[]).filter(
      (room) =>
        room.title.toLowerCase().includes(lowerQuery) ||
        room.description.toLowerCase().includes(lowerQuery) ||
        room.creator.username.toLowerCase().includes(lowerQuery)
    );
  },

  filterRooms: async (filterType: string): Promise<Room[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let filtered = roomsData as Room[];
    
    switch (filterType) {
      case 'Upcoming':
        filtered = filtered.filter((r) => r.status === 'Upcoming');
        break;
      case 'High Rewards':
        filtered = filtered.filter((r) => r.isHighReward);
        break;
      case 'Saved Rooms':
        filtered = filtered.filter((r) => r.isSaved);
        break;
      case 'All Rooms':
      default:
        break;
    }
    return filtered;
  },

  getRoomDetail: async (roomId: string) => {
    // Dynamically import the detail mock data. We return it regardless of ID since it's a mock.
    await new Promise((resolve) => setTimeout(resolve, 300));
    const detailData = await import('../mockapi/room-detail.json');
    return detailData.default;
  },

  getRoomActivity: async (roomId: string) => {
    // Dynamically import activity mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const activityData = await import('../mockapi/room-activity.json');
    return activityData.default;
  }
};
