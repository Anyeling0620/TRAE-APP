import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { encryptKey, decryptKey } from '../../lib/crypto';

export interface ApiKey {
  id: string;
  key: string; // Encrypted
  label?: string;
  provider: 'openai' | 'claude' | 'glm';
  isActive: boolean;
  rateLimitExpiresAt?: number; // Timestamp when rate limit expires
}

interface KeyPoolState {
  keys: ApiKey[];
  currentIndex: number;
  addKey: (key: string, provider: 'openai' | 'claude' | 'glm') => void;
  removeKey: (id: string) => void;
  toggleKey: (id: string) => void;
  markRateLimited: (id: string) => void;
  getNextKey: (provider: 'openai' | 'claude' | 'glm') => { key: string; id: string } | null;
}

export const useKeyPoolStore = create<KeyPoolState>()(
  persist(
    (set, get) => ({
      keys: [],
      currentIndex: 0,
      addKey: (rawKey, provider) =>
        set((state) => ({
          keys: [
            ...state.keys,
            {
              id: crypto.randomUUID(),
              key: encryptKey(rawKey),
              provider,
              isActive: true,
              label: `${provider.toUpperCase()} Key ${state.keys.filter(k => k.provider === provider).length + 1}`
            },
          ],
        })),
      removeKey: (id) =>
        set((state) => ({
          keys: state.keys.filter((k) => k.id !== id),
        })),
      toggleKey: (id) =>
        set((state) => ({
          keys: state.keys.map((k) =>
            k.id === id ? { ...k, isActive: !k.isActive } : k
          ),
        })),
      markRateLimited: (id) =>
        set((state) => ({
          keys: state.keys.map((k) =>
            k.id === id ? { ...k, rateLimitExpiresAt: Date.now() + 60000 } : k
          ),
        })),
      getNextKey: (provider) => {
        const { keys, currentIndex } = get();
        const now = Date.now();
        
        // Filter active and not rate-limited keys
        const validKeys = keys.filter(k => 
          k.provider === provider && 
          k.isActive && 
          (!k.rateLimitExpiresAt || k.rateLimitExpiresAt <= now)
        );
        
        if (validKeys.length === 0) return null;

        // Round-robin logic
        const nextIndex = (currentIndex + 1) % validKeys.length;
        set({ currentIndex: nextIndex });

        const selectedKey = validKeys[nextIndex];
        return { key: decryptKey(selectedKey.key), id: selectedKey.id };
      },
    }),
    {
      name: 'key-pool-storage',
    }
  )
);
