"use client";

import React from 'react';
import { Greeting } from '@/components/dashboard/greeting';
import { useUserProfile } from '@/hooks/use-user-profile';
import { NftList } from '@/components/dashboard/nft-list';

export default function MyNftsPage() {
  const { data: user } = useUserProfile();

  const displayName = user?.username 
    ? (user.username.startsWith('G') && user.username.length >= 40
        ? `${user.username.slice(0, 4)}....${user.username.slice(-4)}`
        : user.username)
    : 'User';

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Welcome Title */}
      <Greeting 
        name={displayName} 
        subtitle="Manage and view all the Gifts you have received." 
      />

      <div className="flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-neutral-1">
            My Collection
          </h2>
        </div>
        
        <NftList />
      </div>
    </div>
  );
}
