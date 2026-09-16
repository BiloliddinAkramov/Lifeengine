// IndexedDB storage for user audio files & playlists
// Supports persistent storage of .mp3, .m4a, .wav, .aac, .ogg blobs

export interface CustomAudioTrack {
  id: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  addedAt: number;
  blob: Blob;
  objectUrl?: string;
}

const DB_NAME = 'LifeEngineAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_tracks';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllTracks(): Promise<CustomAudioTrack[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const tracks: CustomAudioTrack[] = (req.result || []).map((item: any) => ({
          ...item,
          objectUrl: item.blob ? URL.createObjectURL(item.blob) : undefined
        }));
        // Sort newest first
        tracks.sort((a, b) => b.addedAt - a.addedAt);
        resolve(tracks);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get audio tracks from IndexedDB:', err);
    return [];
  }
}

export async function saveTrack(track: Omit<CustomAudioTrack, 'objectUrl'>): Promise<CustomAudioTrack> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Save only serializable data (including Blob)
    const record = {
      id: track.id,
      name: track.name,
      size: track.size,
      type: track.type,
      duration: track.duration,
      addedAt: track.addedAt,
      blob: track.blob
    };

    const req = store.put(record);

    req.onsuccess = () => {
      const withUrl: CustomAudioTrack = {
        ...record,
        objectUrl: URL.createObjectURL(record.blob)
      };
      resolve(withUrl);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function deleteTrack(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllTracks(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
