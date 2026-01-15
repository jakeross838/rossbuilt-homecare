import { cn } from './lib/utils'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Home Care OS - Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            The operating system for luxury home care companies
          </p>
        </header>

        <main className="space-y-6">
          <div className={cn(
            "rounded-lg border bg-card p-6",
            "shadow-sm"
          )}>
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Welcome to Ross Built Home Care
            </h2>
            <p className="text-muted-foreground">
              Admin dashboard coming soon. This app is configured with:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rb-green-500" />
                Vite + React + TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rb-green-500" />
                Tailwind CSS with shadcn/ui theming
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rb-green-500" />
                Supabase client with typed database
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rb-green-500" />
                React Query, Zustand, React Router
              </li>
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium text-card-foreground">Clients</h3>
              <p className="text-2xl font-bold text-primary mt-1">-</p>
              <p className="text-xs text-muted-foreground">Coming in Phase 2</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium text-card-foreground">Properties</h3>
              <p className="text-2xl font-bold text-primary mt-1">-</p>
              <p className="text-xs text-muted-foreground">Coming in Phase 2</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium text-card-foreground">Inspections</h3>
              <p className="text-2xl font-bold text-primary mt-1">-</p>
              <p className="text-xs text-muted-foreground">Coming in Phase 3</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
