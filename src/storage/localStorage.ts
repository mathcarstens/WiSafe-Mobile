declare const require: (name: string) => any;

type StorageDriver = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStorage = new Map<string, string>();

function createMemoryDriver(): StorageDriver {
  return {
    async getItem(key) {
      return memoryStorage.get(key) ?? null;
    },
    async setItem(key, value) {
      memoryStorage.set(key, value);
    },
    async removeItem(key) {
      memoryStorage.delete(key);
    },
  };
}

function resolveDriver(): StorageDriver {
  try {
    const asyncStorage = require("@react-native-async-storage/async-storage").default;

    if (asyncStorage?.getItem && asyncStorage?.setItem) {
      return asyncStorage;
    }
  } catch {
    return createMemoryDriver();
  }

  return createMemoryDriver();
}

export const localStorageDriver = resolveDriver();
