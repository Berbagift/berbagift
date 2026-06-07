interface ParticipantStackProps {
  participants: string[];
  joinedCount: number;
  maxCount: number;
}

export function ParticipantStack({ participants, joinedCount, maxCount }: ParticipantStackProps) {
  // Limit to 4 visible avatars to match the visual design cleanly
  const visibleParticipants = participants.slice(0, 4);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        {visibleParticipants.map((initials, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-7 h-7 rounded-full bg-secondary-100 text-secondary-700 text-[10px] font-bold border border-white z-[${
              10 - index
            }] ${index !== 0 ? '-ml-2' : ''}`}
            style={{ zIndex: 10 - index }}
          >
            {initials}
          </div>
        ))}
      </div>
      <span className="text-xs font-semibold text-black dark:text-neutral-1">
        {joinedCount}/{maxCount} Joined
      </span>
    </div>
  );
}
