import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsService } from '../services';
import { Room } from '../types';

/**
 * Hook to retrieve all rooms (explore + myrooms) with dynamic filters.
 */
export function useRooms(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: async () => {
      return roomsService.getRooms(params);
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to retrieve detailed room info.
 */
export function useRoomDetail(roomId: string) {
  return useQuery({
    queryKey: ['rooms', 'detail', roomId],
    queryFn: async () => {
      return roomsService.getRoomDetail(roomId);
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to retrieve live room participants stream.
 */
export function useRoomActivities(roomId: string) {
  return useQuery({
    queryKey: ['rooms', 'activities', roomId],
    queryFn: async () => {
      return roomsService.getRoomActivities(roomId);
    },
    enabled: !!roomId,
    refetchInterval: 10000,
  });
}

/**
 * Hook mutation to register a new campaign room.
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomData: Omit<Room, 'id'>) => roomsService.createRoom(roomData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

/**
 * Hook mutation to claim THR rewards from a room.
 */
export function useClaimReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomsService.claimReward(roomId),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'activities', roomId] });
    },
  });
}
