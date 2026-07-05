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

export function useRoomDetail(roomId: string) {
  return useQuery({
    queryKey: ['rooms', 'detail', roomId],
    queryFn: () => roomsService.getRoomDetail(roomId),
    enabled: !!roomId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, 'id'>) => roomsService.createRoom(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });
}

export function useClaimReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => roomsService.claimReward(roomId),
    onSuccess: (_, roomId) => qc.invalidateQueries({ queryKey: ['rooms', 'detail', roomId] }),
  });
}
