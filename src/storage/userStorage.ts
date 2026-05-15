import { StoredUser } from "@/src/types/wifi";
import { localStorageDriver } from "@/src/storage/localStorage";

const USER_KEY = "@wisafe:user";

export async function saveStoredUser(user: StoredUser) {
  await localStorageDriver.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const data = await localStorageDriver.getItem(USER_KEY);

  if (!data) return null;

  try {
    return JSON.parse(data) as StoredUser;
  } catch {
    return null;
  }
}

export async function clearStoredUser() {
  await localStorageDriver.removeItem(USER_KEY);
}
