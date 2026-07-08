"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useUpdateProfile } from "@/lib/api/queries/profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/client";

export default function ProfilePage() {
  const { data: user, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    updateProfile.mutate({
      username: username.trim() || undefined,
      email: email.trim() || undefined,
    }, {
      onSuccess: () => {
        setSuccessMsg("Profile updated successfully!");
      },
      onError: (err) => {
        setErrorMsg(getErrorMessage(err));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-neutral-13 dark:text-neutral-1">
            Loading Profile...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-120px)] max-w-3xl mx-auto space-y-6 md:space-y-8 pb-6 md:pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-semibold text-neutral-13 dark:text-neutral-1">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm md:text-base text-neutral-11 dark:text-neutral-5">
          Update your account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Username serves as your identity for receiving THR directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md">
              {successMsg}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Username
            </label>
            <Input
              id="username"
              placeholder="Set a unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={updateProfile.isPending}
            />
            <p className="text-[0.8rem] text-muted-foreground">
              This is your public display name. It must be unique.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={updateProfile.isPending}
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Used for account recovery and notifications.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Wallet Address
            </label>
            <Input
              value={user?.wallet_address || ""}
              disabled
              readOnly
              className="bg-muted text-muted-foreground"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border bg-muted/50 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
