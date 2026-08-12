import { useSyncExternalStore } from "react";

// Mock session only — real authentication is GĐ6 backend scope.
const SESSION_KEY = "ndthich-admin-session";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function login(email: string, password: string): boolean {
  if (!email || !password) return false;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, email);
    notify();
  }
  return true;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
    notify();
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): boolean {
  return Boolean(window.localStorage.getItem(SESSION_KEY));
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
