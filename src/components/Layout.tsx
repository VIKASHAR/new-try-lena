import { Link, Outlet, useLocation } from "react-router-dom"

import { Separator } from "./ui/separator"
import { ThemeToggle } from "./ThemeToggle"
import { LogoutButton } from "./logout-button"
import { Button } from "./ui/button"

const PAGE_META: Record<string, { title: string; section: string }> = {
  "/": { title: "Command Center", section: "Core" },  
  "/agents": { title: "AI Agent Network", section: "Core" },
  "/supply-chain": { title: "Supply Chain", section: "Vision Panel" },
  "/manufacturing": { title: "Manufacturing", section: "Vision Panel" },
  "/commercial": { title: "Commercial & Trading", section: "Vision Panel" },
  "/finance": { title: "Finance & ERP", section: "Vision Panel" },
}

function Layout() {
  const location = useLocation()
  const meta = PAGE_META[location.pathname] ?? {
    title: "EOS Platform",
    section: "",
  }

  return (
    <div>
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-3">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex justify-start gap-3">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold tracking-wide text-foreground">
                LENA
              </span>
            </div>
          </Link>
          <div className="flex items-end gap-2">
            <div className="h-4 w-px bg-border" />
          </div>
          <div className="flex items-center gap-2">
            {meta.section && (
              <>
                <span className="hidden text-xs text-muted-foreground md:block">
                  {meta.section}
                </span>
                <span className="hidden text-xs text-muted-foreground/40 md:block">
                  /
                </span>
              </>
            )}
            <span className="font-heading text-sm font-semibold text-foreground">
              {meta.title}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Separator orientation="vertical" className="mx-1" />
          <Link to="/vision-panel">
            <Button variant="link" size="sm" className="hover:cursor-pointer">
              Back to Vision Panel
            </Button>
          </Link>
          <Separator orientation="vertical" className="mx-1" />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-5">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
