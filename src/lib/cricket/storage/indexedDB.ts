/**
 * IndexedDB Wrapper for Cricket Data Layer
 * 
 * Provides typed CRUD operations for cricket data storage.
 */

import type { DBSchema, DBStoreName } from '../types';

const DB_NAME = 'PlayPalCricketDB';
const DB_VERSION = 1;

class IndexedDBWrapper {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    /**
     * Initialize the IndexedDB database
     */
    async init(): Promise<void> {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB failed to open:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create Players store
                if (!db.objectStoreNames.contains('players')) {
                    const playersStore = db.createObjectStore('players', { keyPath: 'id' });
                    playersStore.createIndex('teamId', 'teamId', { unique: false });
                    playersStore.createIndex('name', 'name', { unique: false });
                    playersStore.createIndex('role', 'role', { unique: false });
                }

                // Create Teams store
                if (!db.objectStoreNames.contains('teams')) {
                    const teamsStore = db.createObjectStore('teams', { keyPath: 'id' });
                    teamsStore.createIndex('name', 'name', { unique: false });
                }

                // Create Matches store
                if (!db.objectStoreNames.contains('matches')) {
                    const matchesStore = db.createObjectStore('matches', { keyPath: 'id' });
                    matchesStore.createIndex('status', 'status', { unique: false });
                    matchesStore.createIndex('teamAId', 'teamAId', { unique: false });
                    matchesStore.createIndex('teamBId', 'teamBId', { unique: false });
                    matchesStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Create Ball Events store
                if (!db.objectStoreNames.contains('ballEvents')) {
                    const eventsStore = db.createObjectStore('ballEvents', { keyPath: 'id' });
                    eventsStore.createIndex('matchId', 'matchId', { unique: false });
                    eventsStore.createIndex('batsmanId', 'batsmanId', { unique: false });
                    eventsStore.createIndex('bowlerId', 'bowlerId', { unique: false });
                    eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                console.log('IndexedDB schema created/upgraded');
            };
        });

        return this.initPromise;
    }

    /**
     * Ensure DB is initialized before operations
     */
    private async ensureDB(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }

    /**
     * Add a record to a store
     */
    async add<K extends DBStoreName>(
        storeName: K,
        data: DBSchema[K]
    ): Promise<DBSchema[K]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get a record by ID
     */
    async get<K extends DBStoreName>(
        storeName: K,
        id: string
    ): Promise<DBSchema[K] | null> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update a record
     */
    async update<K extends DBStoreName>(
        storeName: K,
        data: DBSchema[K]
    ): Promise<DBSchema[K]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete a record
     */
    async delete<K extends DBStoreName>(
        storeName: K,
        id: string
    ): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all records from a store
     */
    async getAll<K extends DBStoreName>(
        storeName: K
    ): Promise<DBSchema[K][]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Query records by index
     */
    async queryByIndex<K extends DBStoreName>(
        storeName: K,
        indexName: string,
        value: any
    ): Promise<DBSchema[K][]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Bulk add records (more efficient for multiple inserts)
     */
    async bulkAdd<K extends DBStoreName>(
        storeName: K,
        items: DBSchema[K][]
    ): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            let completed = 0;
            const total = items.length;

            items.forEach(item => {
                const request = store.add(item);
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
                request.onerror = () => reject(request.error);
            });

            if (total === 0) {
                resolve();
            }
        });
    }

    /**
     * Count records in a store
     */
    async count<K extends DBStoreName>(storeName: K): Promise<number> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all records from a store
     */
    async clear<K extends DBStoreName>(storeName: K): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Export singleton instance
export const db = new IndexedDBWrapper();
