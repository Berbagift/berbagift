interface RoomActionsProps {
  isSaved?: boolean;
  onSave?: () => void;
  onJoin?: () => void;
}

export function RoomActions({ isSaved = false, onSave, onJoin }: RoomActionsProps) {
  return (
    <div className="flex items-center gap-3 mt-5 mb-4">
      <button
        onClick={onSave}
        className="flex items-center justify-center px-4 py-2 rounded-md border border-secondary-500 text-secondary-500 hover:bg-secondary-50 transition-colors font-medium text-sm flex-1 max-w-[100px]"
      >
        {isSaved ? 'Saved' : 'Save'} <i className="fi fi-rr-bookmark ml-2 mt-[2px]" />
      </button>
      <button
        onClick={onJoin}
        className="flex items-center justify-center flex-1 px-4 py-2 rounded-md bg-secondary-500 text-white hover:bg-secondary-600 transition-colors font-medium text-sm whitespace-nowrap"
      >
        Join Room <i className="fi fi-rr-sign-out-alt ml-2 mt-[2px]" />
      </button>
    </div>
  );
}
