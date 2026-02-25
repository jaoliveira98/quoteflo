"use client";

import { createContext, useContext, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Plus,
  Menu,
  LogOut,
  BarChart3,
  Package,
  Loader2,
  Building2,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type DashboardNavContextValue = {
  startNavigation: (href: string) => void;
  openUpgradeDialog: () => void;
  hasAccess: boolean;
  goToStripeSubscription: () => Promise<void>;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext);
  return ctx;
}

const navigationGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Work",
    items: [
      { name: "Quotes", href: "/quotes", icon: FileText },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Services", href: "/services", icon: Package },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Business", href: "/settings/business", icon: Building2 },
      { name: "Quoting", href: "/settings/quoting", icon: FileText },
      { name: "Account", href: "/settings/account", icon: Settings },
    ],
  },
];

interface DashboardShellProps {
  children: React.ReactNode;
  user?: {
    email: string;
    company_name: string;
    brand_color?: string;
  };
  hasAccess?: boolean;
}

interface SidebarContentProps {
  pathname: string;
  loadingPath: string | null;
  isNavigating: boolean;
  handleNavigation: (href: string) => void;
  handleLogout: () => void;
  user?: {
    email: string;
    company_name: string;
    brand_color?: string;
  };
  hasAccess?: boolean;
  onOpenUpgradeDialog?: () => void;
}

function brandAvatarStyle(brandColor: string | undefined) {
  if (!brandColor) return undefined;
  return {
    backgroundColor: `${brandColor}1a`,
    color: brandColor,
  } as React.CSSProperties;
}

function SidebarContent({
  pathname,
  loadingPath,
  isNavigating,
  handleNavigation,
  handleLogout,
  user,
  hasAccess = true,
  onOpenUpgradeDialog,
}: SidebarContentProps) {
  const handleNewQuoteClick = () => {
    if (hasAccess) {
      handleNavigation("/quotes/new");
    } else {
      onOpenUpgradeDialog?.();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-4 border-b border-surface-200">
        <Logo />
      </div>

      <div className="p-4 pb-2">
        <Button
          className="w-full shadow-soft"
          size="lg"
          onClick={handleNewQuoteClick}
          disabled={isNavigating}
          title={hasAccess ? undefined : "Upgrade to create quotes"}
        >
          {loadingPath === "/quotes/new" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Quote
        </Button>
      </div>

      <nav className="flex-1 px-3 pt-2 overflow-y-auto">
        {navigationGroups.map((group, groupIdx) => (
          <div key={group.label} className={cn(groupIdx > 0 && "mt-4")}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const isLoading = loadingPath === item.href;
                
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => handleNavigation(item.href)}
                    disabled={isNavigating && !isLoading}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 h-auto rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-brand-50 text-brand-700 shadow-soft hover:bg-brand-50"
                        : "text-surface-600 hover:bg-surface-50 hover:text-surface-900 active:bg-surface-100",
                      isLoading && "bg-surface-50"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                    ) : (
                      <item.icon className={cn("h-5 w-5", isActive ? "text-brand-600" : "text-surface-400")} />
                    )}
                    {item.name}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-200 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-50"
          onClick={() => handleNavigation("/contact")}
          disabled={isNavigating}
          title="Contact support"
        >
          <HelpCircle className="h-5 w-5 text-surface-400" />
          Contact support
        </Button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center",
              !user?.brand_color && "bg-brand-100"
            )}
            style={user?.brand_color ? brandAvatarStyle(user.brand_color) : undefined}
          >
            <span
              className={cn("text-sm font-medium", !user?.brand_color && "text-brand-700")}
              style={user?.brand_color ? { color: user.brand_color } : undefined}
            >
              {user?.company_name?.charAt(0) || "Q"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate">
              {user?.company_name || "My Company"}
            </p>
            <p className="text-xs text-surface-500 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-surface-400 hover:text-surface-600"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ children, user, hasAccess = true }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  const handleOpenUpgradeDialog = useCallback(() => {
    setSidebarOpen(false);
    setUpgradeDialogOpen(true);
  }, []);

  const goToStripeSubscription = useCallback(async () => {
    setCheckoutLoading(true);
    try {
      let res = await fetch("/api/billing/portal", { method: "POST" });
      let data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      res = await fetch("/api/billing/checkout", { method: "POST" });
      data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      console.error(err);
      setCheckoutLoading(false);
    }
  }, []);

  const handleNavigation = (href: string) => {
    if (pathname === href) return;
    
    setLoadingPath(href);
    setSidebarOpen(false);
    
    startTransition(() => {
      router.push(href);
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isNavigating = isPending || loadingPath !== null;

  const navContextValue: DashboardNavContextValue = {
    startNavigation: handleNavigation,
    openUpgradeDialog: handleOpenUpgradeDialog,
    hasAccess: hasAccess ?? true,
    goToStripeSubscription,
  };

  const sidebarProps: SidebarContentProps = {
    pathname,
    loadingPath,
    isNavigating,
    handleNavigation,
    handleLogout,
    user,
    hasAccess,
    onOpenUpgradeDialog: hasAccess ? undefined : handleOpenUpgradeDialog,
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {isNavigating && (
        <>
          <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-brand-100" aria-hidden="true">
            <div className="h-full bg-brand-500 animate-loading-bar" />
          </div>
          <div className="sr-only" aria-live="polite" role="status">Loading page</div>
        </>
      )}

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation links
          </SheetDescription>
          <SidebarContent {...sidebarProps} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-200">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center h-14 px-4 bg-white/95 backdrop-blur-sm border-b border-surface-200 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="-ml-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-surface-700" />
          </Button>
          <div className="flex-1 flex justify-center">
            <Logo size="sm" />
          </div>
          <Button
            size="icon"
            onClick={hasAccess ? () => handleNavigation("/quotes/new") : handleOpenUpgradeDialog}
            className="-mr-2"
            aria-label={hasAccess ? "New quote" : "Upgrade to create quotes"}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        <main id="main-content" className={cn(
          "min-h-[calc(100vh-3.5rem)] lg:min-h-screen transition-opacity duration-150",
          isNavigating && "opacity-60 pointer-events-none"
        )}>
          {hasAccess === false && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
              Trial or subscription ended.{" "}
              <button
                type="button"
                onClick={goToStripeSubscription}
                disabled={checkoutLoading}
                className="font-medium underline underline-offset-2 hover:no-underline disabled:opacity-70 inline-flex items-center gap-1.5"
              >
                {checkoutLoading ? (
                  "Redirecting…"
                ) : (
                  <>
                    Subscribe to QuoteFlo Pro
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </>
                )}
              </button>{" "}
              to continue.
            </div>
          )}
          <DashboardNavContext.Provider value={navContextValue}>
            {children}
          </DashboardNavContext.Provider>
        </main>
      </div>

      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscription required</DialogTitle>
            <DialogDescription>
              Your trial or subscription has ended. Subscribe to QuoteFlo Pro to continue creating quotes and using all features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
              disabled={checkoutLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={goToStripeSubscription}
              disabled={checkoutLoading}
              className="gap-2"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  Subscribe to QuoteFlo Pro
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
