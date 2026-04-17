import { Outlet, useLocation } from "react-router-dom";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import SystemSidebar from "./SystemSidebar";
import { ThemeToggle } from "./ThemeToggle";

const PAGE_META: Record<string, { title: string; section: string }> = {
  "/vision-panel": { title: "Vision Panel", section: "Core" },
  "/nurostack": { title: "NuroStack", section: "Core" },
  "/consolidated-dashboard/nexus": { title: "Nexus", section: "Core" },
  "/consolidated-dashboard/nurovault": { title: "NuroVault", section: "Core" },
  "/consolidated-dashboard/nuroforge": { title: "NuroForge", section: "Core" },
  "/consolidated-dashboard/nurostack": { title: "NuroStack", section: "Core" },
  "/consolidated-dashboard/nuromodels": { title: "NuroModels", section: "Core" },
  "/settings": { title: "Settings", section: "System" },
};

function SystemLayout() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: "LENA Platform", section: "" };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <SystemSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-sidebar px-5">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" size="icon-lg" />
            <Separator orientation="vertical" className="mx-1" />
            <div className="flex items-center gap-2">
              {meta.section && (
                <>
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {meta.section}
                  </span>
                  <span className="text-muted-foreground/40 hidden md:block text-xs">/</span>
                </>
              )}
              <span className="text-sm font-semibold text-foreground font-heading">
                {meta.title}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SystemLayout;
