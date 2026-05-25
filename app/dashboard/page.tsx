export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background p-8">
      <div className="max-w-6xl mx-auto w-full space-y-4">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome to BagiTHR Dashboard. Content will be placed here.</p>
        
        <div className="w-full h-64 rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/20 mt-8">
          <p className="text-sm text-muted-foreground">Dashboard Area</p>
        </div>
      </div>
    </div>
  );
}
