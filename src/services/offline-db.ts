import { openDB, type DBSchema } from 'idb'
import type { FinanceSnapshot, QueueItem } from '@/types/domain'

interface FinanceDb extends DBSchema {
  snapshots: { key: string; value: FinanceSnapshot }
  queue: { key: number; value: QueueItem; indexes: { createdAt: string } }
}

const dbPromise = openDB<FinanceDb>('vertwo-finance', 1, {
  upgrade(database) {
    database.createObjectStore('snapshots')
    const queue = database.createObjectStore('queue', { keyPath: 'id', autoIncrement: true })
    queue.createIndex('createdAt', 'createdAt')
  }
})

export async function getCachedSnapshot(userId: string): Promise<FinanceSnapshot | undefined> {
  return (await dbPromise).get('snapshots', userId)
}

export async function cacheSnapshot(userId: string, snapshot: FinanceSnapshot): Promise<void> {
  await (await dbPromise).put('snapshots', snapshot, userId)
}

export async function enqueueMutation(item: Omit<QueueItem, 'id' | 'createdAt'>): Promise<void> {
  await (await dbPromise).add('queue', { ...item, createdAt: new Date().toISOString() })
}

export async function getQueuedMutations(): Promise<QueueItem[]> {
  return (await dbPromise).getAllFromIndex('queue', 'createdAt')
}

export async function removeQueuedMutation(id: number): Promise<void> {
  await (await dbPromise).delete('queue', id)
}
