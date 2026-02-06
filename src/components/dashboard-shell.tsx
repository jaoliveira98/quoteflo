"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Plus,
  Menu,
  X,
  LogOut,
  BarChart3,
  Loader2
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Quotes", href: "/quotes", icon: FileText },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface DashboardShellProps {
  children: React.ReactNode;
  user?: {
    email: string;
    company_name: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // Reset loading state when pathname changes
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

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

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top loading bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-brand-100">
          <div className="h-full bg-brand-500 animate-loading-bar" />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-surface-200">
            <Logo />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 active:bg-surface-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Quote Button */}
          <div className="p-4 pb-2">
            <Button 
              className="w-full shadow-sm" 
              size="lg"
              onClick={() => handleNavigation("/quotes/new")}
              disabled={isNavigating}
            >
              {loadingPath === "/quotes/new" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              New Quote
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pt-2 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const isLoading = loadingPath === item.href;
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  disabled={isNavigating && !isLoading}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand-50 text-brand-700 shadow-sm"
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
                </button>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-surface-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-sm font-medium text-brand-700">
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
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex items-center h-14 px-4 bg-white/95 backdrop-blur-sm border-b border-surface-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-surface-100 active:bg-surface-200 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-surface-700" />
          </button>
          <div className="flex-1 flex justify-center">
            <Logo size="sm" />
          </div>
          <button
            onClick={() => handleNavigation("/quotes/new")}
            className="p-2 -mr-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 transition-colors"
            aria-label="New quote"
          >
            <Plus className="h-5 w-5" />
          </button>
        </header>

        {/* Page content */}
        <main className={cn(
          "min-h-[calc(100vh-3.5rem)] lg:min-h-screen transition-opacity duration-150",
          isNavigating && "opacity-60 pointer-events-none"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
