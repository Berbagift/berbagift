import { apiClient, unwrapApiData } from '../client';
import { Room, RoomActivity, Participant } from '../types';

import roomsData from '@/mockapi/rooms.json';
import myroomsData from '@/mockapi/myrooms.json';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

// --- Normalizers (handle both legacy mock format and new API format) ---

function normalizeParticipant(entry: any): Participant {
  if (typeof entry === 'string') return { username: '', initials: entry };
  return { username: entry.username ?? '', initials: entry.initials ?? '??' };
}

function normalizeActivity(a: any): RoomActivity {
  const action = (a.action ?? 'joined').toLowerCase();
  return {
    username: a.username ?? '@anonymous',
    initials: a.initials ?? a.avatar ?? 'AN',
    action: action === 'left' || action === 'leave' ? 'left' : 'joined',
    timestamp: a.timestamp ?? new Date().toISOString(),
  };
}

function normalizeStatus(status: string): string {
  if (!status) return 'Upcoming';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function normalizeRoom(raw: any): Room {
  let claimCountdown = raw.claimCountdown ?? 0;
  if (raw.claim_session_start) {
    const now = Math.floor(Date.now() / 1000);
    const diff = Number(raw.claim_session_start) - now;
    claimCountdown = diff > 0 ? diff : 0;
  }

  // 👱 ponytail: shrink - removed defensive String/Number casting, trust API or use basic fallbacks
  return {
    ...raw,
    id: raw.id ?? `room-${Date.now()}`,
    title: raw.title ?? 'Untitled Room',
    description: raw.description ?? '',
    creator: raw.creator ?? { username: '@unknown', initials: '??', role: 'Room Creator' },
    rewardPool: raw.rewardPool ?? raw.reward ?? '0 XLM',
    rewardPoolIdr: raw.rewardPoolIdr ?? 'Rp 0',
    winners: raw.winners ?? raw.total_winners ?? raw.totalWinners ?? 0,
    joined: raw.joined ?? raw.total_joined ?? raw.joinedParticipants ?? 0,
    maxParticipants: raw.maxParticipants ?? raw.capacity ?? raw.totalParticipants ?? 0,
    participants: (raw.participants ?? []).map(normalizeParticipant),
    activities: (raw.activities ?? []).map(normalizeActivity),
    status: normalizeStatus(raw.status ?? ''),
    statusText: raw.statusText ?? (raw.created_at ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(raw.created_at)) : (raw.dateText ? `Starts in ${raw.dateText}` : '')),
    isHighReward: Boolean(raw.isHighReward),
    isSaved: Boolean(raw.isSaved),
    is_owner: Boolean(raw.is_owner),
    claimCountdown,
    claim_session_start: raw.claim_session_start,
  } as Room;
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

  getMyRooms: async (token: string, params?: { status?: string; search?: string }): Promise<Room[]> => {
    try {
      const res = await apiClient.get<unknown>('/rooms/my-rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return filterRooms((unwrapApiData(res.data) as Record<string, unknown>[]).map(normalizeRoom), params);
    } catch (error) {
      console.warn("Backend /rooms/my-rooms failed, falling back to mock myrooms", error);
      return filterRooms(myroomsData.map(normalizeRoom), params);
    }
  },

  getExploreRooms: async (token: string | null, params?: { status?: string; search?: string }): Promise<Room[]> => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await apiClient.get<unknown>('/rooms/explore', { headers });
      return filterRooms((unwrapApiData(res.data) as Record<string, unknown>[]).map(normalizeRoom), params);
    } catch (error) {
      console.warn("Backend /rooms/explore failed, falling back to mock explore", error);
      return filterRooms(roomsData.map(normalizeRoom), params);
    }
  },

  getRoomDetail: async (id: string, token?: string | null): Promise<Room> => {
    if (isLocalMode) {
      await new Promise((r) => setTimeout(r, 300));
      const all = [...roomsData, ...myroomsData].map(normalizeRoom);
      return all.find((r) => r.id === id) ?? normalizeRoom({ id });
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.get<unknown>(`/rooms/${id}`, { headers });
    return normalizeRoom(unwrapApiData(res.data) as Record<string, unknown>);
  },

  createRoom: async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    if (isLocalMode) {
      await new Promise((r) => setTimeout(r, 500));
      return normalizeRoom({ id: `myroom-${Date.now()}`, ...roomData });
    }

    try {
      const res = await apiClient.post<unknown>('/rooms', roomData);
      return normalizeRoom(unwrapApiData(res.data) as Record<string, unknown>);
    } catch (error) {
      console.warn("Backend /rooms not implemented, falling back to mock room creation");
      return normalizeRoom({ id: `myroom-${Date.now()}`, ...roomData });
    }
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
