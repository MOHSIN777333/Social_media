import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl =
  typeof rawUrl === "string" &&
  (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) &&
  !rawUrl.includes("undefined") &&
  rawUrl.trim() !== "";

const isValidKey =
  typeof rawKey === "string" &&
  rawKey.trim() !== "" &&
  !rawKey.includes("undefined");

// Default seed posts for mock fallback
const INITIAL_POSTS = [
  {
    id: "post-1",
    title: "Welcome to our new community platform!",
    content: "Excited to share our first update with everyone. Feel free to explore, create your own posts, and like discussions with the community!",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    user_name: "Community Admin",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "post-2",
    title: "Exploring Modern UI Design & Clean Architecture",
    content: "Clean layouts, subtle gradients, and dark mode support make for an enjoyable browsing experience. What do you think about the new look?",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    user_name: "Design Studio",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "post-3",
    title: "Photography in Nature: Morning Mountain Escapes",
    content: "Captured this tranquil shot during an early morning hike in the mountains. Nothing beats fresh air, misty ridges, and quiet scenery.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    user_name: "Alex River",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const INITIAL_VOTES = [
  { id: "vote-1", post_id: "post-1", user_id: "demo-user-1", vote: 1 },
  { id: "vote-2", post_id: "post-1", user_id: "demo-user-2", vote: 1 },
  { id: "vote-3", post_id: "post-2", user_id: "demo-user-1", vote: 1 },
];

function getStored(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function createMockSupabaseClient() {
  const authListeners = new Set();
  let currentSession = getStored("mock_auth_session", null);

  const fileStore = new Map();

  return {
    auth: {
      getSession: async () => ({
        data: { session: currentSession },
        error: null,
      }),
      onAuthStateChange: (callback) => {
        authListeners.add(callback);
        // initial trigger
        setTimeout(() => callback("INITIAL", currentSession), 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              },
            },
          },
        };
      },
      signInWithOAuth: async () => {
        const mockUser = {
          id: "github-user-101",
          email: "creator@example.com",
          user_metadata: {
            full_name: "Demo Creator",
            avatar_url:
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          },
        };
        currentSession = {
          user: mockUser,
          access_token: "mock-token",
        };
        setStored("mock_auth_session", currentSession);
        authListeners.forEach((cb) => cb("SIGNED_IN", currentSession));
        return { user: mockUser, session: currentSession, error: null };
      },
      signOut: async () => {
        currentSession = null;
        setStored("mock_auth_session", null);
        authListeners.forEach((cb) => cb("SIGNED_OUT", null));
        return { error: null };
      },
    },

    storage: {
      from: (bucket) => ({
        upload: async (filePath, file) => {
          const url =
            file instanceof Blob || file instanceof File
              ? URL.createObjectURL(file)
              : String(file);
          fileStore.set(`${bucket}/${filePath}`, url);
          return { data: { path: filePath }, error: null };
        },
        getPublicUrl: (filePath) => {
          const url =
            fileStore.get(`${bucket}/${filePath}`) ||
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
          return { data: { publicUrl: url } };
        },
        remove: async (filePaths) => {
          filePaths.forEach((fp) => fileStore.delete(`${bucket}/${fp}`));
          return { data: null, error: null };
        },
      }),
    },

    from: (tableName) => {
      const storageKey = `mock_table_${tableName}`;
      const defaultData =
        tableName === "posts"
          ? INITIAL_POSTS
          : tableName === "votes"
          ? INITIAL_VOTES
          : [];

      const getRecords = () => getStored(storageKey, defaultData);
      const saveRecords = (records) => setStored(storageKey, records);

      let pendingFilters = [];
      let pendingOrder = null;

      const queryBuilder = {
        select: (_columns = "*") => {
          return queryBuilder;
        },

        eq: (col, val) => {
          pendingFilters.push((item) => String(item[col]) === String(val));
          return queryBuilder;
        },

        order: (col, { ascending = true } = {}) => {
          pendingOrder = { col, ascending };
          return queryBuilder;
        },

        maybeSingle: async () => {
          let records = getRecords();
          for (const filter of pendingFilters) {
            records = records.filter(filter);
          }
          return { data: records[0] ?? null, error: null };
        },

        single: async () => {
          let records = getRecords();
          for (const filter of pendingFilters) {
            records = records.filter(filter);
          }
          if (records.length === 0) {
            return { data: null, error: { message: "Row not found" } };
          }
          return { data: records[0], error: null };
        },

        then: (resolve) => {
          let records = getRecords();
          for (const filter of pendingFilters) {
            records = records.filter(filter);
          }
          if (pendingOrder) {
            records = [...records].sort((a, b) => {
              const valA = a[pendingOrder.col];
              const valB = b[pendingOrder.col];
              if (valA < valB) return pendingOrder.ascending ? -1 : 1;
              if (valA > valB) return pendingOrder.ascending ? 1 : -1;
              return 0;
            });
          }
          resolve({ data: records, error: null });
        },

        insert: (rows) => {
          const rowList = Array.isArray(rows) ? rows : [rows];
          const records = getRecords();
          const newItems = rowList.map((row) => ({
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            user_name: currentSession?.user?.user_metadata?.full_name || "Community User",
            avatar_url: currentSession?.user?.user_metadata?.avatar_url || null,
            ...row,
          }));

          saveRecords([...records, ...newItems]);

          const insertChain = {
            select: () => insertChain,
            single: async () => ({ data: newItems[0], error: null }),
            then: (resolve) => resolve({ data: newItems, error: null }),
          };
          return insertChain;
        },

        update: (updates) => {
          return {
            eq: (col, val) => {
              const records = getRecords().map((item) => {
                if (String(item[col]) === String(val)) {
                  return { ...item, ...updates };
                }
                return item;
              });
              saveRecords(records);
              return {
                then: (resolve) => resolve({ data: records, error: null }),
              };
            },
          };
        },

        delete: () => {
          return {
            eq: (col, val) => {
              const records = getRecords().filter(
                (item) => String(item[col]) !== String(val)
              );
              saveRecords(records);
              return {
                then: (resolve) => resolve({ data: records, error: null }),
              };
            },
          };
        },
      };

      return queryBuilder;
    },
  };
}

let clientInstance;

if (isValidUrl && isValidKey) {
  try {
    clientInstance = createClient(rawUrl, rawKey);
  } catch (err) {
    console.warn("Failed to initialize Supabase client, falling back to mock:", err);
    clientInstance = createMockSupabaseClient();
  }
} else {
  console.info("[AI Studio] Supabase credentials not provided. Using in-memory & local-storage mock.");
  clientInstance = createMockSupabaseClient();
}

export const supabase = clientInstance;
