'use client';

import React from 'react';
import { CreateRoomModule } from '@/components/rooms/create-room-module';

export default function CreateRoomPage() {
  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8 flex flex-col min-h-full">
      {/* Main Content Area - Centered Card */}
      <div className="flex-1 flex justify-center pb-12">
        <CreateRoomModule />
      </div>
    </div>
  );
}
