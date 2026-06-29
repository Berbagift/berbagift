import { apiClient, unwrapApiData } from '../client';
import { Room, RoomActivity } from '../types';

import roomsData from '@/mockapi/rooms.json';
import myroomsData from '@/mockapi/myrooms.json';
import roomDetailData from '@/mockapi/room-detail.json';
import roomActivityData from '@/mockapi/room-activity.json';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

type RawRoom = Partial<Room> & {
  dateText?: string;
  totalWinners?: number;
  totalParticipants?: number;
  joinedParticipants?: number;
};

type RawRoomActivity = Omit<Partial<RoomActivity>, 'action'> & {
  action?: string;
};

const defaultCreator = {
  username: '@berbagift',
  initials: 'BG',
  role: 'Room Creator',
};

function normalizeRoom(room: RawRoom): Room {
  return {
    id: String(room.id ?? `room-${Date.now()}`),
    title: room.title ?? 'Untitled Room',
    description: room.description ?? '',
    creator: room.creator ?? defaultCreator,
    rewardPool: room.rewardPool ?? '0 XLM',
    rewardPoolIdr: room.rewardPoolIdr,
    winners: room.winners ?? room.totalWinners ?? 0,
    joined: room.joined ?? room.joinedParticipants ?? 0,
    maxParticipants: room.maxParticipants ?? room.totalParticipants ?? 0,
    participants: room.participants ?? [],
    status: room.status ?? 'Upcoming',
    statusText: room.statusText ?? (room.dateText ? `Starts in ${room.dateText}` : ''),
    isHighReward: room.isHighReward ?? false,
    isSaved: room.isSaved ?? false,
    claimCountdown: room.claimCountdown ?? null,
    createdAt: room.createdAt ?? null,
  };
}

function applyRoomFilters(rooms: Room[], params?: { status?: string; search?: string }): Room[] {
  let data = rooms;

  if (params?.status && params.status !== 'All Rooms') {
    if (params.status === 'Upcoming') {
      data = data.filter((room) => room.status === 'Upcoming');
    } else if (params.status === 'High Rewards') {
      data = data.filter((room) => room.isHighReward);
    } else if (params.status === 'Saved Rooms') {
      data = data.filter((room) => room.isSaved);
    } else {
      data = data.filter((room) => room.status === params.status);
    }
  }

  if (params?.search?.trim()) {
    const query = params.search.toLowerCase();
    data = data.filter(
      (room) =>
        room.title.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query) ||
        room.creator.username.toLowerCase().includes(query)
    );
  }

  return data;
}

function normalizeRoomActivity(activity: RawRoomActivity, roomId: string): RoomActivity {
  return {
    id: String(activity.id ?? `${roomId}-${Date.now()}`),
    roomId: String(activity.roomId ?? roomId),
    username: activity.username ?? '@anonymous',
    avatar: activity.avatar ?? 'AN',
    action: activity.action === 'Leave' ? 'Leave' : 'Joined',
    timestamp: activity.timestamp ?? 'Just now',
  };
}

export const roomsService = {
  /**
   * Retrieve list of all rooms (both explore public and user rooms).
   */
  getRooms: async (params?: { status?: string; search?: string }): Promise<Room[]> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulating delay
      const data = [...roomsData, ...myroomsData].map((room) => normalizeRoom(room));
      return applyRoomFilters(data, params);
    }

    const res = await apiClient.get<Room[] | { data: RawRoom[] }>('/rooms');
    const data = unwrapApiData<RawRoom[]>(res.data).map((room) => normalizeRoom(room));
    return applyRoomFilters(data, params);
  },

  /**
   * Retrieve details of a specific room.
   */
  getRoomDetail: async (id: string): Promise<Room> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const allRooms = [...roomsData, ...myroomsData].map((room) => normalizeRoom(room));
      const foundRoom = allRooms.find((room) => room.id === id);
      const hasDedicatedDetail = String(roomDetailData.id) === id;
      return normalizeRoom(hasDedicatedDetail ? { ...foundRoom, ...roomDetailData } : foundRoom ?? roomDetailData);
    }

    const res = await apiClient.get<Room | { data: RawRoom }>(`/rooms/${id}`);
    return normalizeRoom(unwrapApiData<RawRoom>(res.data));
  },

  /**
   * Retrieve participants activity logs for a specific room.
   */
  getRoomActivities: async (roomId: string): Promise<RoomActivity[]> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return roomActivityData.map((activity) => normalizeRoomActivity(activity, roomId));
    }

    const res = await apiClient.get<RoomActivity[] | { data: RawRoomActivity[] }>('/room-activities', {
      params: { roomId },
    });
    return unwrapApiData<RawRoomActivity[]>(res.data).map((activity) =>
      normalizeRoomActivity(activity, roomId)
    );
  },

  /**
   * Create a new campaign room.
   */
  createRoom: async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return normalizeRoom({
        id: `myroom-${Date.now()}`,
        ...roomData,
        createdAt: roomData.createdAt ?? new Date().toISOString(),
      });
    }

    const res = await apiClient.post<Room | { data: RawRoom }>('/rooms', roomData);
    return normalizeRoom(unwrapApiData<RawRoom>(res.data));
  },

  /**
   * Claim dynamic rewards from a room.
   */
  claimReward: async (roomId: string): Promise<{ success: boolean; txHash?: string }> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, txHash: 'GC...CLAIMED_TX_HASH_PLACEHOLDER' };
    }

    const res = await apiClient.post<{ success: boolean; txHash?: string } | { data: { success: boolean; txHash?: string } }>(
      `/rooms/${roomId}/claim`
    );
    return unwrapApiData<{ success: boolean; txHash?: string }>(res.data);
  },
};
