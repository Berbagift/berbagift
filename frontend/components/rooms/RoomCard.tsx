import { Room } from '@/services/room.service';
import { RoomStats } from './RoomStats';
import { ParticipantStack } from './ParticipantStack';
import { RoomActions } from './RoomActions';

interface RoomCardProps {
  room: Room;
  onSave?: (id: string) => void;
  onJoin?: (id: string) => void;
}

export function RoomCard({ room, onSave, onJoin }: RoomCardProps) {
  return (
    <div className="flex flex-col bg-white dark:bg-card border border-neutral-4 dark:border-border rounded-xl p-6 hover:border-secondary-300 transition-all duration-200 hover:shadow-sm group h-full">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <h3 className="text-xl font-semibold text-black dark:text-neutral-1 line-clamp-2 leading-tight">
          {room.title}
        </h3>
        <p className="text-sm font-normal text-neutral-10 dark:text-neutral-4 line-clamp-2 leading-snug">
          {room.description}
        </p>
      </div>

      {/* Creator Info */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center font-bold text-sm">
          {room.creator.initials}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-black dark:text-neutral-1">
            {room.creator.username}
          </span>
          <span className="text-[10px] font-normal text-neutral-7 dark:text-neutral-6">
            {room.creator.role}
          </span>
        </div>
      </div>

      {/* Stats */}
      <RoomStats rewardPool={room.rewardPool} winners={room.winners} />

      {/* Participant Stack */}
      <ParticipantStack 
        participants={room.participants} 
        joinedCount={room.joined} 
        maxCount={room.maxParticipants} 
      />

      <div className="mt-auto">
        {/* Actions */}
        <RoomActions 
          isSaved={room.isSaved} 
          onSave={() => onSave?.(room.id)} 
          onJoin={() => onJoin?.(room.id)} 
        />

        {/* Footer Status */}
        <div className="flex items-center gap-2 pt-4 border-t border-neutral-3 dark:border-border/50">
          <i className="fi fi-rr-calendar text-neutral-8 dark:text-neutral-6 text-sm flex items-center mt-[2px]" />
          <span className="text-xs font-medium text-neutral-8 dark:text-neutral-6">
            {room.statusText}
          </span>
        </div>
      </div>
    </div>
  );
}
