import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsService } from '../services';
import { Room } from '../types';

export function useRooms(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () => roomsService.getRooms(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyRooms(token: string | null, params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['myrooms', params, token],
    queryFn: () => roomsService.getMyRooms(token!, params),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useExploreRooms(token: string | null, params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['exploreRooms', params, token],
    queryFn: () => roomsService.getExploreRooms(token, params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRoomDetail(roomId: string, token?: string | null) {
  return useQuery({
    queryKey: ['rooms', 'detail', roomId, token],
    queryFn: () => roomsService.getRoomDetail(roomId, token),
    enabled: roomId != null && !!token,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, 'id'>) => roomsService.createRoom(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      qc.invalidateQueries({ queryKey: ['myrooms'] });
    },
  });
}

export function useClaimReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsService.claimReward(roomId),
    onSuccess: (_, roomId) => qc.invalidateQueries({ queryKey: ['rooms', 'detail', roomId] }),
  });
}

export function useCheckClaimed(roomId: string, token: string | null) {
  return useQuery({
    queryKey: ['rooms', 'check-claimed', roomId, token],
    queryFn: () => roomsService.checkClaimed(roomId, token!),
    enabled: !!roomId && !!token,
    staleTime: 1000 * 60 * 2,
  });
}

export function useRoomActivities(roomId: string) {
  return useQuery({
    queryKey: ['rooms', 'activities', roomId],
    queryFn: () => roomsService.getRoomActivities(roomId),
    enabled: !!roomId,
    staleTime: 3000,
  });
}

export function useRoomParticipants(roomId: string) {
  return useQuery({
    queryKey: ['rooms', 'participants', roomId],
    queryFn: () => roomsService.getRoomParticipants(roomId),
    enabled: !!roomId,
    staleTime: 3000,
  });
}
