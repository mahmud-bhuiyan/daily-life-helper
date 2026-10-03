import { useState, type SubmitEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  MailIcon,
  PasswordInput,
} from "../../components/ui";
import { useAuth } from "../../hooks";
import { ApiError } from "../../lib/api";
import {
  clearRememberedLogin,
  loadRememberedLogin,
  saveRememberedLogin,
} from "../../lib/rememberLogin";

const buildInitialForm = () => {
  const saved = loadRememberedLogin();
  return {
    email: saved?.email ?? "",
    password: saved?.password ?? "",
    rememberMe: saved !== null,
  };
};

let cachedInitialForm: ReturnType<typeof buildInitialForm> | undefined;

const getInitialForm = () => {
  if (!cachedInitialForm) {
    cachedInitialForm = buildInitialForm();
  }
  return cachedInitialForm;
};

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState(() => getInitialForm().email);
  const [password, setPassword] = useState(() => getInitialForm().password);
  const [rememberMe, setRememberMe] = useState(
    () => getInitialForm().rememberMe,
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });

      if (rememberMe) {
        saveRememberedLogin(email, password);
      } else {
        clearRememberedLogin();
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-bg flex items-center justify-center p-4 sm:p-6">
      <div className="animate-fade-in w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-(--radius-card) bg-(--accent)/15 text-2xl ring-1 ring-(--accent)/30">
            ✦
          </div>
          <p className="text-overline text-(--accent)">Daily Life Helper</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--text)">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-(--muted)">
            Sign in to manage your daily expenses
          </p>
        </div>

        <Card variant="glass">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leadingIcon={<MailIcon />}
              required
            />
            <PasswordInput
              autoComplete="current-password"
              aria-label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-(--border) bg-(--bg) accent-(--accent)"
              />
              <span className="text-sm text-(--text)">
                Remember me for 1 day
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-(--radius-input) border border-(--danger)/30 bg-(--danger)/10 px-4 py-3 text-sm text-(--danger)"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="mt-1 w-full">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-(--muted)">
          Accounts are created by your administrator
        </p>
      </div>
    </div>
  );
};
