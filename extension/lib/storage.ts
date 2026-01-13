// Chrome storage utilities for Launch Ext

export const storage = {
  // Get item from storage
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  // Set item in storage
  async set(key: string, value: any): Promise<boolean> {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  // Remove item from storage
  async remove(key: string): Promise<boolean> {
    try {
      await chrome.storage.local.remove(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  // Clear all storage
  async clear(): Promise<boolean> {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },
};

// Specific storage keys
export const STORAGE_KEYS = {
  WALLET: 'wallet',
  LAUNCHES: 'launches',
  SETTINGS: 'settings',
  ENCRYPTED_KEY: 'encrypted_key',
  BANNER_HISTORY: 'banner_history',
};
