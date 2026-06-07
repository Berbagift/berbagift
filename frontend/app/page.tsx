import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="w-full h-[72px] border-b border-border flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center">
            <i className="fi fi-rr-gift mt-[2px]"></i>
          </div>
          <span className="font-semibold text-lg tracking-tight">BagiTHR</span>
        </div>
        <nav className="flex items-center gap-4">
          <ConnectWalletButton />
        </nav>
      </header>

      {/* Minimalist Hero */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15]">
            Reward communities <br className="hidden md:block" />
            <span className="text-primary">beautifully.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            A simple, transparent, and secure platform to send digital rewards using Stellar XLM and USDC.
          </p>
          <div className="pt-6">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-8 h-12 text-[15px] font-medium shadow-sm transition-all hover:-translate-y-0.5">
                Get Started
                <i className="fi fi-rr-arrow-right ml-2 mt-[1px]"></i>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
