"use client";

import { useState, useEffect, useRef } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useUpdateProfile } from "@/lib/api/queries/profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/client";
import { User, Mail, Wallet, Copy, Check, Save, ShieldCheck } from "lucide-react";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-120px)] max-w-4xl mx-auto space-y-8 pb-8 px-4">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-card border border-border animate-pulse">
        <div className="w-24 h-24 rounded-full bg-emerald-100/80 dark:bg-emerald-800/30" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-48 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
          <div className="h-4 w-36 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="rounded-2xl border border-border bg-card animate-pulse">
        <div className="border-b border-border p-6 bg-emerald-50/20 dark:bg-emerald-900/5 space-y-2">
          <div className="h-6 w-48 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
          <div className="h-4 w-72 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-20 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
                <div className="h-12 w-full bg-emerald-100/80 dark:bg-emerald-800/30 rounded-xl" />
                <div className="h-3 w-48 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-border space-y-3">
            <div className="h-4 w-28 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
            <div className="h-12 w-full bg-emerald-100/80 dark:bg-emerald-800/30 rounded-xl" />
            <div className="h-3 w-64 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
          </div>
        </div>
        <div className="border-t border-border p-6 bg-emerald-50/20 dark:bg-emerald-900/5 flex justify-end">
          <div className="h-12 w-36 bg-emerald-100/80 dark:bg-emerald-800/30 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const initialized = useRef(false);

  useEffect(() => {
    if (user && !initialized.current) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      initialized.current = true;
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
        setTimeout(() => setSuccessMsg(""), 5000);
      },
      onError: (err) => {
        setErrorMsg(getErrorMessage(err));
      }
    });
  };

  const copyToClipboard = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.wallet_address) return user.wallet_address.charAt(0).toUpperCase();
    return "?";
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-120px)] max-w-4xl mx-auto space-y-8 pb-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-card border border-border">
        {user?.avatar_url ? (
          <img
            src={user?.avatar_url}
            alt="User Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-border shadow-sm"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center text-4xl font-bold text-muted-foreground">
            {getInitial()}
          </div>
        )}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user?.username ? `@${user.username}` : "Welcome to Berbagift"}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Verified Bagi THR Identity</span>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-border bg-card">
        <CardHeader className="border-b border-border pb-6 bg-muted/20">
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your identity to receive THR seamlessly across the network.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {errorMsg && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-2 animate-in slide-in-from-top-2">
              <div className="w-1.5 h-full bg-destructive rounded-full"></div>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-4 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 animate-in slide-in-from-top-2">
              <Check className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 group">
              <label htmlFor="username" className="text-sm font-semibold flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                <User className="w-4 h-4" /> Username
              </label>
              <Input
                id="username"
                placeholder="Set a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={updateProfile.isPending}
                className="h-12 bg-background border-border focus-visible:ring-primary/50 transition-all rounded-xl"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                This is your public display name. It must be unique.
              </p>
            </div>

            <div className="space-y-3 group">
              <label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-foreground/80 group-focus-within:text-primary transition-colors">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateProfile.isPending}
                className="h-12 bg-background border-border focus-visible:ring-primary/50 transition-all rounded-xl"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Used for notifications.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
              <Wallet className="w-4 h-4" /> Wallet Address
            </label>
            <div className="relative flex items-center">
              <Input
                value={user?.wallet_address || ""}
                disabled
                readOnly
                className="h-12 bg-muted text-muted-foreground font-mono text-sm border-dashed rounded-xl pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              Your connected Stellar Web3 wallet address. This cannot be changed.
            </p>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/20 border-t border-border pt-6 pb-6 px-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="h-12 px-8 rounded-xl transition-all duration-300"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
