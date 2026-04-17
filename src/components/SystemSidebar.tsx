import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import USER_NAME from "@/data/data";

import {
  LayoutDashboard,
  BrainCircuit,
  Truck,
  Factory,
  TrendingUp,
  Brain,
  Settings
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const CORE_NAV = [
  { label: "Vision Panel", to: "/vision-panel", icon: LayoutDashboard, exact: true },
  { label: "Nexus", to: "/nexus", icon: BrainCircuit },
  { label: "NuroVault", to: "/nurovault", icon: Truck},
  { label: "NuroForge", to: "/nuroforge", icon: Factory },
  { label: "NuroStack", to: "/nurostack", icon: TrendingUp },
  {label: "NuroModels", to: "/nuromodels", icon: Brain},
];

const SYSTEM_NAV = [
  { label: "Settings", to: "/settings", icon: Settings, exact: true },
]

export function Logo() {
  return (
    <svg
      viewBox="0 0 1000 500"
      className="h-8 w-auto text-foreground/90"
      fill="currentColor"
    >
      <path
        fill="currentColor"
        d="M538.092 164.179C551.712 163.492 565.104 164.493 578.674 164.891C621.324 166.143 664.298 172.292 703.742 189.269C725.334 198.563 750.135 217.587 749.847 243.475C749.472 277.189 707.792 292.6 679.6 291.912C677.155 280.806 677.176 285.155 684.736 279.599C702.205 267.297 702.667 239.49 690.511 222.83C659.71 180.615 584.778 176.26 537.632 180.16C476.39 185.227 432.894 219.76 392.666 262.519C374.366 281.971 356.546 303.645 337.604 322.653C312.125 348.823 285.166 367.716 254.971 387.705C260.401 388.861 267.853 391.565 273.537 393.059C287.124 396.63 303.662 399.861 317.722 400.151C344.32 400.701 367.653 391.716 382.514 368.775C388.574 359.42 393.563 348.136 399.404 338.616C401.632 334.985 406.616 324.501 409.105 322.16C414.032 320.965 460.56 320.491 464.046 321.868C464.061 322.607 461.005 328.607 460.44 329.67C448.366 352.405 435.386 374.763 423.559 397.62C422.887 398.918 422.566 401.479 422.822 402.932C423.733 408.087 429.328 407.014 432.972 405.947C457.39 399.641 476.464 378.61 488.364 357.3C491.084 352.429 493.425 346.949 496.254 342.122C500.141 335.491 502.907 327.763 506.846 321.261C511.703 320.805 523.57 321.088 529.107 321.121C539.765 321.185 552.498 320.765 562.984 321.421C558.429 331.242 553.278 340.774 547.559 349.965C560.453 338.078 579.102 327.115 595.616 321.421C606.667 317.61 622.381 316.091 632.893 321.735C639.342 325.126 644.905 330.665 647.036 337.768C650.507 349.343 642.14 360.499 637.201 370.337C633.037 378.527 628.968 386.711 624.573 394.787C622.965 397.742 619.028 405.201 624.402 406.717C630.516 408.441 637.468 405.083 642.554 402.851C658.066 396.042 660.409 390.181 664.192 374.4C672.462 352.619 690.086 332.876 711.079 322.817C734.015 311.827 768.301 308.382 781.056 335.68C786.065 324.12 792.574 312.584 798.371 301.404C804.168 290.223 809.418 279.135 815.588 268.098L849.249 268.069C855.457 268.064 863.974 267.798 869.932 268.41C867.553 273.934 864.164 278.936 861.669 284.33C856.243 296.058 849.718 307.356 843.949 318.845C833.929 338.801 823.548 358.358 813.623 378.371C809.761 386.159 804.01 394.531 801.887 403.016C807.54 416.626 837.488 393.39 840.648 390.542C841.549 383.792 842.58 380.269 844.693 373.753C857.807 339.588 894.889 317.861 930.715 316.277C980.315 314.084 987.482 354.214 943.847 373.691C930.32 379.729 910.09 385.444 895.038 386.24C894.814 394.368 893.815 400.682 899.73 407.261C911.347 420.184 940.773 412.666 954.438 406.854C957.721 405.457 969.812 399.379 971.756 399.476C973.479 401.51 972.972 407.033 972.93 409.82C958.251 417.293 943.069 425.795 927.186 430.179C896.676 438.6 851.48 440.973 840.984 402.804C823.777 416.631 778.156 447.98 756.995 425.892C751.732 420.398 750.982 414.279 751.289 406.99C747.866 410.541 743.461 413.621 739.448 416.452C727.158 425.12 715.354 431.593 700.182 433.118C684.739 434.67 672.843 429.799 664.225 416.625C661.178 411.968 660.373 409.088 659.797 403.728C659.563 403.942 659.327 404.152 659.089 404.359C642.268 418.994 610.373 435.084 587.352 432.786C578.939 431.946 573.156 430.368 567.522 423.812C557.207 411.81 566.716 397.513 572.91 386.117C576.027 380.33 579.047 374.492 581.969 368.605C584.17 364.218 586.679 359.672 587.072 354.684C587.215 352.87 587.076 350.834 585.769 349.436C584.42 347.994 582.327 347.621 580.435 347.577C552.842 346.937 528.731 389.617 517.391 411.07C514.943 415.701 510.953 426.323 507.272 429.409C505.271 431.086 457.487 429.889 450.925 429.643C457.55 418.323 462.875 406.518 470.172 395.57C456.327 408.248 436.594 421.725 418.816 428.116C406.506 432.11 388.113 435.895 376.026 430.113C362.683 423.73 361.345 410.133 367.629 397.97C356.638 410.049 333.846 422.725 318.449 427.726C293.911 435.697 262.791 434.213 238.395 426.488C227.66 423.088 216.058 417.873 206.025 412.811C164.273 432.779 106.905 439.279 61.5848 426.937C53.2932 424.137 43.616 420.118 37.1396 414.17C10.3362 389.554 41.3012 368.791 64.7235 362.46C82.0079 357.787 96.1162 357.344 113.661 356.3C117.376 356.079 121.017 356.98 124.728 356.912C152.43 357.441 179.598 363.329 205.527 372.232C212.517 365.148 219.993 358.436 226.77 351.57C240.73 337.488 254.46 323.18 267.956 308.653C282.698 292.944 295.085 277.323 310.727 262C354.733 219.25 409.235 188.856 468.736 173.883C483.809 170.128 499.155 167.574 514.631 166.244C520.839 165.649 532.805 165.284 538.092 164.179ZM142.346 411.854C147.683 409.671 151.851 407.927 156.995 405.298C161.066 403.217 168.112 398.868 172.074 397.407C158.91 390.309 111.316 369.904 97.8988 373.245C89.9314 373.985 80.9753 374.103 75.352 380.766C68.8069 388.52 71.4816 401.234 79.3743 407.093C91.5601 416.138 111.856 417.332 126.388 415.632C131.83 414.96 137.181 413.693 142.346 411.854ZM729.609 405.814C742.483 402.438 752.233 392.043 758.588 380.564C764.258 370.32 772.484 352.963 770.402 340.864C769.089 333.228 762.162 333.635 756.253 334C742.914 337.604 732.725 353.313 725.63 364.665C720.343 373.124 713.464 388.884 715.293 398.971C716.79 406.217 723.534 406.508 729.609 405.814ZM897.237 375.515C900.015 374.891 903.306 374.24 906.009 373.482C921.033 368.502 936.961 359.108 944.388 344.56C945.639 342.076 946.653 339.479 947.417 336.805C946.059 332.476 945.865 331.761 942.615 328.749L937.763 328.727C919.005 329.825 901.767 359.358 897.237 375.515Z"
      />
      <path
        fill="currentColor"
        d="M459.654 254.491C465.595 253.384 473.921 255.256 478.819 258.853C483.558 262.316 486.73 267.517 487.637 273.316C490.192 290.642 474.725 303.754 458.75 305.827C422.747 309.059 419.275 261.109 459.654 254.491Z"
      />
    </svg>
  );
}

function NavGroup({
  label,
  items,
}: {
  label: string;
  items: typeof CORE_NAV
}) {
  const location = useLocation();

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to;

  return (
    <SidebarGroup className="p-0 mb-1">
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40 px-3 h-7">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const active = isActive(item.to, (item as { exact?: boolean }).exact);
            const badge = (item as { badge?: string }).badge;
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "relative h-9 rounded-md px-3 text-sm font-medium transition-all duration-150",
                    "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    active && [
                      "text-sidebar-foreground bg-sidebar-accent",
                      "border-l-4 border-primary rounded-l-none",
                      "hover:bg-sidebar-accent",
                    ],
                  )}
                >
                  <Link to={item.to} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "opacity-100 text-primary" : "opacity-60",
                      )}
                    />
                    {item.label}
                    {badge && !active && (
                      <SidebarMenuBadge className="ml-auto text-[10px] bg-chart-3/15 text-chart-3 rounded-full px-1.5">
                        {badge}
                      </SidebarMenuBadge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SystemSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-4 py-3.5 border-b border-sidebar-border">
        <Link to="/" className="flex justify-start gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-bold tracking-wide text-foreground">
            LENA
            </span>
          </div>
          <div className="flex items-end gap-2">
          <div className="h-4 w-px bg-border" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Powered by IBM Watsonx
          </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        <div className="pr-8 pl-2">
            <NavGroup label="Core" items={CORE_NAV} />
        </div>
        <SidebarSeparator className="my-4" />
        <div className="pr-8 pl-2">
            <NavGroup label="System" items={SYSTEM_NAV} />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-default">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">{USER_NAME.charAt(0)}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground leading-tight truncate">
              {USER_NAME}
            </span>
            <span className="text-[11px] text-sidebar-foreground/50 leading-tight">
              COO
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default SystemSidebar;
