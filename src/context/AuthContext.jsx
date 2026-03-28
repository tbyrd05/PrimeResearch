import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const ACCOUNTS_KEY = 'prime-research-accounts';
const USER_SESSION_KEY = 'prime-research-user-session';
const OWNER_ACCOUNT = {
  name: 'Prime Research Owner',
  email: 'realprimeresearch@gmail.com',
  password: 'Goeagles512!',
};

function readAccounts() {
  const stored = window.localStorage.getItem(ACCOUNTS_KEY);
  const accounts = stored ? JSON.parse(stored) : [];
  const hasOwnerAccount = accounts.some(
    (account) => account.email.toLowerCase() === OWNER_ACCOUNT.email
  );

  if (hasOwnerAccount) {
    return accounts;
  }

  const nextAccounts = [...accounts, OWNER_ACCOUNT];
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
  return nextAccounts;
}

function writeAccounts(accounts) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = window.sessionStorage.getItem(USER_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      window.sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(USER_SESSION_KEY);
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isOwner: user?.email?.toLowerCase() === 'realprimeresearch@gmail.com',
    signUp({ name, email, password }) {
      const normalizedEmail = email.toLowerCase();
      const accounts = readAccounts();
      const existing = accounts.find((account) => account.email.toLowerCase() === normalizedEmail);

      if (existing) {
        return { ok: false, message: 'An account with that email already exists.' };
      }

      const account = { name, email: normalizedEmail, password };
      writeAccounts([...accounts, account]);
      setUser({ name, email: normalizedEmail });
      return { ok: true };
    },
    signIn({ email, password }) {
      const accounts = readAccounts();
      if (!accounts.length) {
        return { ok: false, message: 'Create an account first.' };
      }

      const account = accounts.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
      if (!account || account.password !== password) {
        return { ok: false, message: 'Email or password is incorrect.' };
      }

      setUser({ name: account.name, email: account.email });
      return { ok: true };
    },
    signOut() {
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
