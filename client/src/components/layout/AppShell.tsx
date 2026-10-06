import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth, useCategories, useItems } from "../../hooks";
import { Button } from "../ui/Button";
import { Sidebar } from "./Sidebar";

/** Keep shared lists in the TanStack Query cache while navigating the shell. */
const ShellQuerySubscriptions = () => {
  useCategories();
  useItems();
  return null;
};

const UserAvatar = ({ name }: { name: string }) => {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--accent)/15 text-sm font-semibold text-(--accent) ring-1 ring-(--accent)/25">
      {initial}
    </span>
  );
};

export const AppShell = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell-bg flex h-dvh min-h-0 w-full shrink-0 overflow-hidden">
      <ShellQuerySubscriptions />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-(--shell-header-h) shrink-0 items-center justify-between gap-3 border-b border-(--border)/80 bg-(--surface)/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-(--radius-input) border border-(--border) bg-(--bg)/50 text-(--text) transition-colors hover:bg-(--surface-hover) lg:hidden"
              aria-label="Open menu"
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-3 rounded-full bg-current" />
              </span>
            </button>

            <div className="flex min-w-0 items-center gap-3">
              {user && <UserAvatar name={user.displayName} />}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-(--text)">
                  {user?.displayName}
                </p>
                <p className="truncate text-xs text-(--muted)">{user?.email}</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="shrink-0"
          >
            Log out
          </Button>
        </header>

        <main className="surface-grid min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
