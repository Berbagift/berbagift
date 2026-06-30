import { apiClient, unwrapApiData } from '../client';
import { Room, RoomActivity, Participant } from '../types';

import roomsData from '@/mockapi/rooms.json';
import myroomsData from '@/mockapi/myrooms.json';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

// --- Normalizers (handle both legacy mock format and new API format) ---

function normalizeParticipant(entry: string | { username?: string; initials?: string }): Participant {
  if (typeof entry === 'string') return { username: '', initials: entry };
  return { username: entry.username ?? '', initials: entry.initials ?? '??' };
}

function normalizeActivity(a: Record<string, unknown>): RoomActivity {
  const action = String(a.action ?? 'joined').toLowerCase();
  return {
    username: String(a.username ?? '@anonymous'),
    initials: String(a.initials ?? a.avatar ?? 'AN'),
    action: action === 'left' || action === 'leave' ? 'left' : 'joined',
    timestamp: String(a.timestamp ?? new Date().toISOString()),
  };
}

function normalizeStatus(status: string): string {
  if (!status) return 'Upcoming';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function normalizeRoom(raw: Record<string, unknown>): Room {
  const participants = Array.isArray(raw.participants) ? raw.participants : [];
  const activities = Array.isArray(raw.activities) ? raw.activities : [];

  return {
    id: String(raw.id ?? `room-${Date.now()}`),
    title: String(raw.title ?? 'Untitled Room'),
    description: String(raw.description ?? ''),
    creator: (raw.creator as Room['creator']) ?? { username: '@unknown', initials: '??', role: 'Room Creator' },
    rewardPool: String(raw.rewardPool ?? '0 XLM'),
    rewardPoolIdr: raw.rewardPoolIdr as string | undefined,
    winners: Number(raw.winners ?? raw.totalWinners ?? 0),
    joined: Number(raw.joined ?? raw.joinedParticipants ?? 0),
    maxParticipants: Number(raw.maxParticipants ?? raw.totalParticipants ?? 0),
    participants: participants.map(normalizeParticipant),
    activities: activities.map(normalizeActivity),
    status: normalizeStatus(String(raw.status ?? '')),
    statusText: String(raw.statusText ?? (raw.dateText ? `Starts in ${raw.dateText}` : '')),
    isHighReward: Boolean(raw.isHighReward),
    isSaved: Boolean(raw.isSaved),
    claimCountdown: (raw.claimCountdown as number) ?? null,
    startsAt: (raw.startsAt as string) ?? null,
    createdAt: (raw.createdAt as string) ?? null,
  };
}

// --- Service ---

export const roomsService = {
  getRooms: async (params?: { status?: string; search?: string }): Promise<Room[]> => {
    if (isLocalMode) {
      await new Promise((r) => setTimeout(r, 300));
      return filterRooms([...roomsData, ...myroomsData].map(normalizeRoom), params);
    }

    const res = await apiClient.get<unknown>('/rooms');
    return filterRooms((unwrapApiData(res.data) as Record<string, unknown>[]).map(normalizeRoom), params);
  },

  getRoomDetail: async (id: string): Promise<Room> => {
    if (isLocalMode) {
      await new Promise((r) => setTimeout(r, 300));
      const all = [...roomsData, ...myroomsData].map(normalizeRoom);
      return all.find((r) => r.id === id) ?? normalizeRoom({ id });
    }

    const res = await apiClient.get<unknown>(`/rooms/${id}`);
    return normalizeRoom(unwrapApiData(res.data) as Record<string, unknown>);
  },

  createRoom: async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    if (isLocalMode) {
      await new Promise((r) => setTimeout(r, 500));
      return normalizeRoom({ id: `myroom-${Date.now()}`, ...roomData });
    }

    const res = await apiClient.post<unknown>('/rooms', roomData);
    return normalizeRoom(unwrapApiData(res.data) as Record<string, unknown>);
  },

  claimReward: async (roomId: string): Promise<{ success: boolean; txHash?: string }> => {
    if (isLocalMode) {
      await new Promise((r) => setTimeout(r, 1000));
      return { success: true, txHash: 'GC...MOCK_TX_HASH' };
    }

    const res = await apiClient.post<unknown>(`/rooms/${roomId}/claim`);
    return unwrapApiData(res.data) as { success: boolean; txHash?: string };
  },
};

// --- Helpers ---

function filterRooms(rooms: Room[], params?: { status?: string; search?: string }): Room[] {
  let data = rooms;

  if (params?.status && params.status !== 'All Rooms') {
    if (params.status === 'High Rewards') data = data.filter((r) => r.isHighReward);
    else if (params.status === 'Saved Rooms') data = data.filter((r) => r.isSaved);
    else data = data.filter((r) => r.status === params.status);
  }

  if (params?.search?.trim()) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.creator.username.toLowerCase().includes(q)
    );
  }

  return data;
}
