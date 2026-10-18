import { useState } from "react";
import { PageHeader } from "../../../components/layout";
import {
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  ErrorBanner,
  SkeletonRows,
  UserMinusIcon,
} from "../../../components/ui";
import {
  useAdminUsers,
  useAuth,
  useCreateUser,
  useDeactivateUser,
  useUpdateUser,
} from "../../../hooks";
import type { UserAdmin } from "../../../types";
import { UserEditModal } from "./components/UserEditModal";
import { UserFormModal } from "./components/UserFormModal";
import { UserResetPasswordModal } from "./components/UserResetPasswordModal";
import { UserTable } from "./components/UserTable";

export const UsersAdminPage = () => {
  const { user } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserAdmin | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserAdmin | null>(
    null,
  );
  const [deactivating, setDeactivating] = useState<UserAdmin | null>(null);

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
        action={
          <Button onClick={() => setCreateModalOpen(true)}>Add user</Button>
        }
      />

      {showSkeleton && (
        <>
          <SkeletonRows
            count={3}
            rowClassName="h-40 rounded-(--radius-card) bg-(--surface) xl:hidden"
          />
          <div className="hidden xl:block">
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
          onAction={() => setCreateModalOpen(true)}
        />
      )}

      {data && data.length > 0 && (
        <UserTable
          users={data}
          currentUserId={user?.id}
          onEdit={setEditing}
          onResetPassword={setResetPasswordUser}
          onDeactivate={(id) => {
            const target = data.find((u) => u.id === id);
            if (target) setDeactivating(target);
          }}
          deactivatingId={
            deactivateUser.isPending ? deactivating?.id : undefined
          }
        />
      )}

      <UserFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={async (input) => {
          await createUser.mutateAsync(input);
        }}
      />

      <UserEditModal
        user={editing}
        open={editing !== null}
        isSelf={editing?.id === user?.id}
        onClose={() => setEditing(null)}
        onSubmit={async (id, input) => {
          await updateUser.mutateAsync({ id, ...input });
        }}
      />

      <UserResetPasswordModal
        user={resetPasswordUser}
        open={resetPasswordUser !== null}
        onClose={() => setResetPasswordUser(null)}
        onSubmit={async (id, password) => {
          await updateUser.mutateAsync({ id, password });
        }}
      />

      <ConfirmModal
        open={deactivating !== null}
        onClose={() => setDeactivating(null)}
        onConfirm={async () => {
          if (!deactivating) return;
          await deactivateUser.mutateAsync(deactivating.id);
          setDeactivating(null);
        }}
        title="Deactivate user?"
        description={
          deactivating ? (
            <>
              <span className="font-semibold text-(--text)">
                {deactivating.displayName}
              </span>
              <span className="text-(--muted)"> · {deactivating.email}</span>
              <span className="mt-2 block text-(--muted)">
                They won&apos;t be able to sign in. Their expense data stays in
                the app.
              </span>
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Deactivate"
        destructive
        icon={<UserMinusIcon className="h-6 w-6" />}
        loading={deactivateUser.isPending}
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
