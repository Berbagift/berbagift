import React from 'react';
import { ParticipantStack } from './ParticipantStack';
import { RoomStats } from './RoomStats';

export interface MyRoom {
  id: string;
  title: string;
  description: string;
  rewardPool: string;
  winners: number;
  participants: string[];
  joined: number;
  maxParticipants: number;
  status: 'Active' | 'Completed' | 'Draft';
  dateText: string;
}

interface MyRoomCardProps {
  room: MyRoom;
  onEdit?: (id: string) => void;
  onShare?: (id: string) => void;
  onViewResult?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MyRoomCard({ room, onEdit, onShare, onViewResult, onDelete }: MyRoomCardProps) {
  const isCompleted = room.status === 'Completed';
  const isDraft = room.status === 'Draft';

  // Status badge colors
  const badgeColors = {
    Active: 'bg-[#EBF3FE] text-[#3B82F6] dark:bg-blue-950/40 dark:text-blue-400',
    Completed: 'bg-[#E9F9EF] text-[#22C55E] dark:bg-emerald-950/40 dark:text-emerald-400',
    Draft: 'bg-[#FFF7ED] text-[#EA580C] dark:bg-amber-950/40 dark:text-amber-400',
  };

  return (
    <div className="flex flex-col bg-white dark:bg-card border border-border rounded-xl p-6 h-full justify-between gap-5 group transition-all duration-200">
      <div className="flex flex-col gap-4">
        {/* Title and Description */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl font-bold text-black dark:text-neutral-1 line-clamp-1 leading-snug">
            {room.title}
          </h3>
          <p className="text-sm font-medium text-[#595959] dark:text-neutral-4 line-clamp-2 leading-relaxed min-h-[40px]">
            {room.description}
          </p>
        </div>

        {/* Stats */}
        <RoomStats rewardPool={room.rewardPool} winners={room.winners} />

        {/* Participant Stack */}
        <ParticipantStack
          participants={room.participants}
          joinedCount={room.joined}
          maxCount={room.maxParticipants}
        />
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        {/* Actions Row */}
        <div className="flex items-center gap-3">
          {isDraft ? (
            <>
              <button
                onClick={() => onDelete?.(room.id)}
                className="flex-1 h-10 rounded-lg border border-neutral-3 dark:border-neutral-800 hover:border-red-500 hover:text-red-500 text-neutral-8 dark:text-neutral-3 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-card"
              >
                <i className="fi fi-rr-trash text-sm mt-[1px]" />
                Delete
              </button>
              <button
                onClick={() => onEdit?.(room.id)}
                className="flex-1 h-10 rounded-lg bg-[#16A34A] hover:bg-[#15803d] text-white font-medium text-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                View Draft
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onShare?.(room.id)}
                className="flex-1 h-10 rounded-lg border border-[#16a34a] hover:bg-[#16a34a]/5 dark:hover:bg-[#16a34a]/10 bg-white dark:bg-card text-[#16a34a] font-medium text-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                {isCompleted ? 'Share Result' : 'Share Room'}
              </button>
              <button
                onClick={() => isCompleted ? onViewResult?.(room.id) : onEdit?.(room.id)}
                className="flex-1 h-10 rounded-lg bg-[#16A34A] hover:bg-[#15803d] text-white font-medium text-sm transition-colors flex items-center justify-center cursor-pointer"
              >
                {isCompleted ? 'View Result' : 'Edit Room'}
              </button>
            </>
          )}
        </div>

        {/* Divider and Footer date */}
        <div className="flex items-center gap-2 pt-4 border-t border-border/60">
          <i className="fi fi-rr-calendar text-[#595959] dark:text-neutral-4 text-sm mt-[2px]" />
          <span className="text-[13px] font-semibold text-[#595959] dark:text-neutral-4">
            {isCompleted ? `Completed in ${room.dateText}` : `Starts in ${room.dateText}`}
          </span>
        </div>

        {/* Status Badge at the bottom */}
        <div className={`w-fit px-3 py-1 rounded-md text-[13px] font-semibold leading-none ${badgeColors[room.status]}`}>
          {room.status}
        </div>
      </div>
    </div>
  );
}
