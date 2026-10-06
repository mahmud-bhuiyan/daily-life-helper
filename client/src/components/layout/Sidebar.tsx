import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navItems: Array<{
  to: string;
  label: string;
  end?: boolean;
  adminOnly?: boolean;
}> = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/expenses", label: "Expenses" },
  { to: "/items", label: "Items" },
  { to: "/admin/users", label: "Users", adminOnly: true },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center gap-3 rounded-(--radius-input) px-3 text-sm transition-all duration-150 ${
    isActive
      ? "border-l-2 border-(--accent) bg-(--accent)/10 pl-2.5 font-medium text-(--text)"
      : "border-l-2 border-transparent text-(--muted) hover:bg-(--surface-hover) hover:text-(--text)"
  }`;

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { isSuperAdmin } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isSuperAdmin,
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-(--border) bg-(--surface) shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex h-(--shell-header-h) shrink-0 items-center border-b border-(--border)/80 px-5">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="leading-tight">
              <p className="text-overline text-(--accent)">Daily Life</p>
              <p className="mt-0.5 text-xl font-semibold tracking-tight text-(--text)">
                Helper
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-(--radius-input) text-(--muted) hover:bg-(--surface-hover) hover:text-(--text) lg:hidden"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              className={navLinkClass}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-(--border) p-4">
          <p className="text-xs text-(--muted)">Phase 1 · Expense tracker</p>
        </div>
      </aside>
    </>
  );
};
