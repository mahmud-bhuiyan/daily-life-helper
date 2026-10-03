const STORAGE_KEY = 'dlh_remember_login';
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day

type StoredLogin = {
  email: string;
  password: string;
  expiresAt: number;
};

/** Remove saved credentials from localStorage. */
export const clearRememberedLogin = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/** Load email/password if saved within the last 24 hours; clears expired entries. */
export const loadRememberedLogin = (): { email: string; password: string } | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as StoredLogin;

    if (Date.now() > data.expiresAt) {
      clearRememberedLogin();
      return null;
    }

    return { email: data.email, password: data.password };
  } catch {
    clearRememberedLogin();
    return null;
  }
};

/** Persist credentials in localStorage; auto-expires after 1 day. */
export const saveRememberedLogin = (email: string, password: string): void => {
  const data: StoredLogin = {
    email,
    password,
    expiresAt: Date.now() + TTL_MS,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
