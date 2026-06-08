const storageKey = 'copower'; // Base key for localStorage entries

/**
 * Get a value from localStorage
 * @param key The key of the item to retrieve
 * @returns The value of the item or null if not found
 */
function StorageGet(key: string): any {
  const value = localStorage.getItem(storageKey + '_' + key);
  try {
    return value !== null ? JSON.parse(value) : value;
  } catch (error) {
    return value;
  }
}

/**
 * Remove a value from localStorage
 * @param key The key of the item to remove
 */
function StorageRemove(key: string): any {
  localStorage.removeItem(storageKey + '_' + key);
}

/**
 * Set a value in localStorage
 * @param key The key of the item to set
 * @param value The value of the item to set
 */
function StorageSet(key: string, value: any): any {
  localStorage.setItem(storageKey + '_' + key, JSON.stringify(value))
}

export { StorageGet, StorageRemove, StorageSet }