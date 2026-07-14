with open("frontend/lib/api/types/rooms.ts", "r") as f:
    content = f.read()
if "is_owner?: boolean;" not in content:
    content = content.replace("is_joined?: boolean;", "is_joined?: boolean;\n  is_owner?: boolean;")
    with open("frontend/lib/api/types/rooms.ts", "w") as f:
        f.write(content)

with open("frontend/components/rooms/detail/RoomActionButtons.tsx", "r") as f:
    content = f.read()

if "isOwner?:" not in content:
    content = content.replace("isSessionStarted?: boolean;", "isSessionStarted?: boolean;\n  isOwner?: boolean;")
    content = content.replace("= true }: RoomActionButtonsProps)", "= true, isOwner = false }: RoomActionButtonsProps)")
    
    # disable claim if owner
    content = content.replace("const isClaimDisabled = s !== 'claim_open' && s !== 'active';", "const isClaimDisabled = isOwner || (s !== 'claim_open' && s !== 'active');")
    
    # disabled leave if owner
    # For Leave Room, we need to add disabled prop. Let's see the button.
    content = content.replace(
        "className=\"flex-1 flex items-center justify-center gap-2 px-4 h-14 rounded-lg font-medium text-xl text-secondary-500 bg-white dark:bg-card border border-secondary-500 dark:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-950/30 transition-colors\"",
        "disabled={isOwner}\n            className={`flex-1 flex items-center justify-center gap-2 px-4 h-14 rounded-lg font-medium text-xl transition-colors ${isOwner ? 'bg-neutral-6 text-white cursor-not-allowed dark:bg-neutral-9 dark:text-neutral-5 border-none' : 'text-secondary-500 bg-white dark:bg-card border border-secondary-500 dark:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-950/30'}`}"
    )

    with open("frontend/components/rooms/detail/RoomActionButtons.tsx", "w") as f:
        f.write(content)

with open("frontend/components/rooms/detail/RoomStatsCard.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "isSessionStarted={isFinished}",
    "isSessionStarted={isFinished}\n              isOwner={room.is_owner}"
)
with open("frontend/components/rooms/detail/RoomStatsCard.tsx", "w") as f:
    f.write(content)
