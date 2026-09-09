import {
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  WalletCards,
  WifiOff,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useFinanceStore } from "@/store/finance-store";
import { useTheme } from "./theme-context";

const navigation = [
  { to: "/", label: "خانه", icon: LayoutDashboard },
  { to: "/transactions", label: "تراکنش‌ها", icon: WalletCards },
  { to: "/installments", label: "اقساط", icon: CreditCard },
  { to: "/gold", label: "طلا", icon: CircleDollarSign },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo.svg" alt="" className="size-10 rounded-xl" />
      <div>
        <p className="font-extrabold">ورتو فایننس</p>
        <p className="text-[11px] text-slate-500">تصویر روشن‌تری از پول شما</p>
      </div>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="ناوبری اصلی">
      {navigation.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-gold-400/15 text-gold-600 dark:text-gold-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5",
            )
          }
        >
          <Icon className="size-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isOnline = useFinanceStore((state) => state.isOnline);
  const syncing = useFinanceStore((state) => state.syncing);
  const isDemo = useAuthStore((state) => state.isDemo);
  const signOut = useAuthStore((state) => state.signOut);
  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 border-l bg-white/70 p-5 backdrop-blur-xl dark:bg-[#0b0d10]/90 lg:flex lg:flex-col">
        <Brand />
        <div className="mt-10 flex-1">
          <NavItems />
        </div>
        <div className="space-y-2 border-t pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
            تغییر پوسته
          </Button>
          {!isDemo && (
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500"
              onClick={() => void signOut()}
            >
              <LogOut className="size-5" />
              خروج از حساب
            </Button>
          )}
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-slate-50/85 px-4 backdrop-blur-xl dark:bg-[#0b0d10]/85 lg:mr-64 lg:px-8">
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="باز کردن فهرست"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </Button>
        </div>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {!isOnline ? (
            <>
              <WifiOff className="size-4 text-amber-500" />
              حالت آفلاین
            </>
          ) : syncing ? (
            "در حال همگام‌سازی..."
          ) : isDemo ? (
            "حالت نمایشی"
          ) : (
            <>
              <span className="size-2 rounded-full bg-emerald-500" />
              همگام
            </>
          )}
        </div>
      </header>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setMenuOpen(false);
          }}
        >
          <aside className="mr-auto flex h-full w-72 flex-col border-r bg-white p-5 dark:bg-[#111418]">
            <div className="flex items-center justify-between">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                aria-label="بستن"
                onClick={() => setMenuOpen(false)}
              >
                <X />
              </Button>
            </div>
            <div className="mt-10">
              <NavItems onNavigate={() => setMenuOpen(false)} />
            </div>
          </aside>
        </div>
      )}
      <main className="mx-auto px-4 py-6 pb-28 lg:mr-64 lg:px-8 lg:py-8 lg:pb-8">
        <Outlet />
      </main>
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-white/90 px-2 pt-2 backdrop-blur-xl dark:bg-[#111418]/95 lg:hidden"
        aria-label="ناوبری پایین"
      >
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-lg py-1 text-[11px]",
                isActive ? "text-gold-500" : "text-slate-500",
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
