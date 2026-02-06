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
  LogOut,
  BarChart3,
  Loader2
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface SidebarContentProps {
  pathname: string;
  loadingPath: string | null;
  isNavigating: boolean;
  handleNavigation: (href: string) => void;
  handleLogout: () => void;
  user?: {
    email: string;
    company_name: string;
  };
}

function SidebarContent({
  pathname,
  loadingPath,
  isNavigating,
  handleNavigation,
  handleLogout,
  user,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-14 px-4 border-b border-surface-200">
        <Logo />
      </div>

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

      <nav className="flex-1 px-3 pt-2 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isLoading = loadingPath === item.href;
          
          return (
            <Button
              key={item.name}
              variant="ghost"
              onClick={() => handleNavigation(item.href)}
              disabled={isNavigating && !isLoading}
              className={cn(
                "w-full justify-start gap-3 px-3 py-2.5 h-auto rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm hover:bg-brand-50"
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
      </nav>

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

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

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

  const sidebarProps: SidebarContentProps = {
    pathname,
    loadingPath,
    isNavigating,
    handleNavigation,
    handleLogout,
    user,
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-brand-100">
          <div className="h-full bg-brand-500 animate-loading-bar" />
        </div>
      )}

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
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
            onClick={() => handleNavigation("/quotes/new")}
            className="-mr-2"
            aria-label="New quote"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

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
