import { useState } from "react";
import { PageHeader } from "../../../components/layout";
import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  SkeletonRows,
} from "../../../components/ui";
import {
  useAdminUsers,
  useAuth,
  useCreateUser,
  useDeactivateUser,
  useUpdateUser,
} from "../../../hooks";
import { UserFormModal } from "./components/UserFormModal";
import { UserTable } from "./components/UserTable";

export const UsersAdminPage = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isPending, isError, error, refetch } = useAdminUsers();
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
          <SkeletonRows
            count={3}
            rowClassName="h-36 rounded-(--radius-card) bg-(--surface) md:hidden"
          />
          <div className="hidden md:block">
            <SkeletonRows
              count={1}
              rowClassName="h-64 rounded-(--radius-card) bg-(--surface)"
            />
          </div>
        </>
      )}

      {isError && !data && (
        <ErrorBanner
          message={
            error instanceof Error ? error.message : "Could not load users."
          }
          onRetry={() => refetch()}
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
            updateUser.mutate({ id, password });
          }}
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
