import {
  Badge,
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  KeyIcon,
  PencilIcon,
  Tooltip,
  UserMinusIcon,
} from "../../../../components/ui";
import type { UserAdmin } from "../../../../types";

type UserTableProps = {
  users: UserAdmin[];
  currentUserId?: string;
  onEdit: (user: UserAdmin) => void;
  onDeactivate: (id: string) => void;
  onResetPassword: (user: UserAdmin) => void;
  deactivatingId?: string;
};

const formatRole = (role: UserAdmin["role"]) =>
  role?.replaceAll("_", " ") ?? "—";

const UserAvatar = ({ name }: { name: string }) => {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--accent)/15 text-sm font-semibold text-(--accent) ring-1 ring-(--accent)/25"
      aria-hidden
    >
      {initial}
    </span>
  );
};

type UserRowActionsProps = {
  user: UserAdmin;
  isSelf: boolean;
  deactivating: boolean;
  onEdit: () => void;
  onResetPassword: () => void;
  onDeactivate: () => void;
  className?: string;
};

const UserRowActions = ({
  user,
  isSelf,
  deactivating,
  onEdit,
  onResetPassword,
  onDeactivate,
  className = "",
}: UserRowActionsProps) => (
  <div className={`flex shrink-0 gap-1 ${className}`}>
    <Tooltip label="Edit user">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="px-2.5"
        onClick={onEdit}
        disabled={!user.isActive}
        aria-label={`Edit ${user.displayName}`}
      >
        <PencilIcon />
      </Button>
    </Tooltip>
    <Tooltip label="Reset password">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="px-2.5"
        onClick={onResetPassword}
        disabled={!user.isActive}
        aria-label={`Reset password for ${user.displayName}`}
      >
        <KeyIcon />
      </Button>
    </Tooltip>
    <Tooltip
      label={
        isSelf
          ? "Can't deactivate your account"
          : deactivating
            ? "Deactivating…"
            : "Deactivate user"
      }
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="px-2.5 text-(--danger) hover:border-(--danger)/30 hover:bg-(--danger)/10"
        onClick={onDeactivate}
        disabled={!user.isActive || isSelf || deactivating}
        aria-label={`Deactivate ${user.displayName}`}
      >
        <UserMinusIcon />
      </Button>
    </Tooltip>
  </div>
);

const userColumns = (
  currentUserId: string | undefined,
  deactivatingId: string | undefined,
  onEdit: (user: UserAdmin) => void,
  onResetPassword: (user: UserAdmin) => void,
  onDeactivate: (id: string) => void,
): DataTableColumn<UserAdmin>[] => [
  {
    id: "name",
    header: "Name",
    width: "24%",
    render: (user) => {
      const isSelf = user.id === currentUserId;
      return (
        <>
          <span className="font-medium text-(--text)">{user.displayName}</span>
          {isSelf && (
            <span className="ml-2 text-xs font-normal text-(--accent)">
              (you)
            </span>
          )}
        </>
      );
    },
  },
  {
    id: "email",
    header: "Email",
    width: "30%",
    cellClassName: "truncate text-(--muted)",
    render: (user) => user.email,
  },
  {
    id: "role",
    header: "Role",
    width: "14%",
    cellClassName: "capitalize text-(--text)",
    render: (user) => formatRole(user.role),
  },
  {
    id: "status",
    header: "Status",
    width: "14%",
    headerAlign: "center",
    cellAlign: "center",
    render: (user) => (
      <Badge variant={user.isActive ? "success" : "muted"}>
        {user.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    width: "8.5rem",
    headerAlign: "center",
    cellAlign: "center",
    cellClassName: "whitespace-nowrap",
    render: (user) => {
      const isSelf = user.id === currentUserId;
      return (
        <UserRowActions
          user={user}
          isSelf={isSelf}
          deactivating={deactivatingId === user.id}
          onEdit={() => onEdit(user)}
          onResetPassword={() => onResetPassword(user)}
          onDeactivate={() => onDeactivate(user.id)}
          className="inline-flex justify-center"
        />
      );
    },
  },
];

export const UserTable = ({
  users,
  currentUserId,
  onEdit,
  onDeactivate,
  onResetPassword,
  deactivatingId,
}: UserTableProps) => (
  <DataTable
    data={users}
    getRowKey={(user) => user.id}
    columns={userColumns(
      currentUserId,
      deactivatingId,
      onEdit,
      onResetPassword,
      onDeactivate,
    )}
    renderMobileRow={(user) => {
      const isSelf = user.id === currentUserId;

      return (
        <Card padding="none" className="shadow-elevated">
          <div className="flex gap-3 p-5 sm:p-6">
            <UserAvatar name={user.displayName} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-(--text)">
                    {user.displayName}
                    {isSelf && (
                      <span className="ml-1.5 text-xs font-normal text-(--accent)">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-(--muted)">
                    {user.email}
                  </p>
                </div>
                <span className="shrink-0">
                  <Badge variant={user.isActive ? "success" : "muted"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </span>
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wider text-(--muted)">
                Role
              </p>
              <p className="mt-0.5 capitalize text-sm text-(--text)">
                {formatRole(user.role)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 border-t border-(--border)/80 bg-(--bg)/30 px-3 py-2.5">
            <UserRowActions
              user={user}
              isSelf={isSelf}
              deactivating={deactivatingId === user.id}
              onEdit={() => onEdit(user)}
              onResetPassword={() => onResetPassword(user)}
              onDeactivate={() => onDeactivate(user.id)}
            />
          </div>
        </Card>
      );
    }}
  />
);
