import { Badge, Button, Card } from '../../../../components/ui';
import type { UserAdmin } from '../../../../types';

type UserTableProps = {
  users: UserAdmin[];
  currentUserId?: string;
  onDeactivate: (id: string) => void;
  onResetPassword: (id: string, password: string) => Promise<void>;
  deactivatingId?: string;
};

const formatRole = (role: UserAdmin['role']) => role.replace('_', ' ');

export const UserTable = ({
  users,
  currentUserId,
  onDeactivate,
  onResetPassword,
  deactivatingId,
}: UserTableProps) => {
  const handleReset = async (id: string) => {
    const password = window.prompt('Enter new password (min 8 characters):');
    if (!password || password.length < 8) return;
    await onResetPassword(id, password);
  };

  return (
    <>
      {/* Mobile: card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;

          return (
            <Card key={user.id} padding="default">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-(--text)">{user.displayName}</p>
                  <p className="truncate text-sm text-(--muted)">{user.email}</p>
                </div>
                <Badge variant={user.isActive ? 'success' : 'muted'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="muted">{formatRole(user.role)}</Badge>
                {isSelf && <Badge variant="success">You</Badge>}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => handleReset(user.id)}
                  disabled={!user.isActive}
                >
                  Reset password
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => onDeactivate(user.id)}
                  disabled={!user.isActive || isSelf || deactivatingId === user.id}
                >
                  Deactivate
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-(--radius-card) border border-(--border) bg-(--surface) shadow-elevated md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-(--border) bg-(--bg)/40 text-(--muted)">
              <tr>
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUserId;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-(--border)/70 transition-colors last:border-0 hover:bg-(--surface-hover)/40"
                  >
                    <td className="px-5 py-4 font-medium text-(--text)">
                      {user.displayName}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-(--accent)">(you)</span>
                      )}
                    </td>
                    <td className="max-w-48 truncate px-5 py-4 text-(--muted)">{user.email}</td>
                    <td className="px-5 py-4 capitalize text-(--text)">{formatRole(user.role)}</td>
                    <td className="px-5 py-4">
                      <Badge variant={user.isActive ? 'success' : 'muted'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReset(user.id)}
                          disabled={!user.isActive}
                        >
                          Reset password
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDeactivate(user.id)}
                          disabled={!user.isActive || isSelf || deactivatingId === user.id}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
