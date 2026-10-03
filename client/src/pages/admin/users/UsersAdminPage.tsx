import { useState } from "react";
import { PageHeader } from "../../../components/layout";
import { Button, Card, EmptyState } from "../../../components/ui";
import {
  useAdminUsers,
  useAuth,
  useCreateUser,
  useDeactivateUser,
  useUpdateUser,
} from "../../../hooks";
import { UserFormModal } from "./components/UserFormModal";
import { UserTable } from "./components/UserTable";

const UsersSkeleton = () => (
  <div className="space-y-3 md:hidden">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-36 animate-pulse rounded-(--radius-card) bg-(--surface)"
      />
    ))}
  </div>
);

export const UsersAdminPage = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isPending, isError } = useAdminUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();

  const showSkeleton = isPending && !data;

  return (
    <>
      <PageHeader
        title="Users"
        description="Create and manage accounts. Only super admins can access this page."
        action={<Button onClick={() => setModalOpen(true)}>Add user</Button>}
      />

      {showSkeleton && (
        <>
          <UsersSkeleton />
          <div className="mt-4 hidden h-64 animate-pulse rounded-(--radius-card) bg-(--surface) md:block" />
        </>
      )}

      {isError && !data && (
        <EmptyState
          title="Could not load users"
          description="Check your connection and try again."
        />
      )}

      {data && data.length === 0 && (
        <EmptyState
          title="No users yet"
          description="Create the first user account to get started."
          actionLabel="Add user"
          onAction={() => setModalOpen(true)}
        />
      )}

      {data && data.length > 0 && (
        <UserTable
          users={data}
          currentUserId={user?.id}
          onDeactivate={(id) => deactivateUser.mutate(id)}
          onResetPassword={async (id, password) => {
            await updateUser.mutateAsync({ id, password });
          }}
          deactivatingId={
            deactivateUser.isPending ? deactivateUser.variables : undefined
          }
        />
      )}

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (input) => {
          await createUser.mutateAsync(input);
        }}
      />

      {data && data.length > 0 && (
        <Card className="mt-6" variant="default">
          <p className="text-sm text-(--muted)">
            <span className="font-medium text-(--text)">{data.length}</span>{" "}
            total accounts · Deactivated users cannot sign in but their data is
            preserved.
          </p>
        </Card>
      )}
    </>
  );
};
