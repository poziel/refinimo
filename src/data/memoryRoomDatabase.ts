import type { RoomDatabase, RoomSnapshot, RoomTransaction } from './roomDatabase'

type Tree = Record<string, unknown>

function copy<T> (value: T): T {
  // Room data is JSON. This also unwraps Vue proxies at the persistence boundary.
  // eslint-disable-next-line unicorn/prefer-structured-clone -- structuredClone rejects Vue proxies.
  return JSON.parse(JSON.stringify(value)) as T
}

function parts (path: string) {
  const keys = path.split('/').filter(Boolean)
  if (keys.some(key => ['__proto__', 'constructor', 'prototype'].includes(key))) {
    throw new Error('Invalid room data path')
  }
  return keys
}

function snapshot (value: unknown): RoomSnapshot {
  const data = copy(value ?? null)
  return { exists: () => data != null, val: () => copy(data) }
}

/** Ephemeral data for the public demo. Never reads or writes browser storage. */
export class MemoryRoomDatabase implements RoomDatabase {
  private tree: Tree
  private listeners = new Set<{ path: string, callback: (snapshot: RoomSnapshot) => void, last?: string }>()
  private queued = false
  private disposed = false

  constructor (initial: Tree = {}) {
    this.tree = copy(initial)
  }

  read (path: string): RoomSnapshot {
    let value: unknown = this.tree
    for (const key of parts(path)) {
      value = value && typeof value === 'object' ? (value as Tree)[key] : null
    }
    return snapshot(value)
  }

  subscribe (path: string, callback: (snapshot: RoomSnapshot) => void) {
    const listener = { path, callback }
    this.listeners.add(listener)
    this.notify()
    return () => {
      this.listeners.delete(listener)
    }
  }

  async set (path: string, value: unknown) {
    if (this.disposed) {
      return
    }
    this.write(path, value)
    this.notify()
  }

  async update (path: string, values: Record<string, unknown>) {
    if (this.disposed) {
      return
    }
    // Validate before applying, and publish one snapshot for the entire update.
    for (const key of Object.keys(values)) {
      parts(`${path}/${key}`)
    }
    for (const [key, value] of Object.entries(values)) {
      this.write(`${path}/${key}`, value)
    }
    this.notify()
  }

  async transaction (path: string, change: RoomTransaction) {
    const value = this.read(path)
    if (this.disposed) {
      return { committed: false, snapshot: value }
    }
    const next = change(value.val())
    if (next === undefined) {
      return { committed: false, snapshot: value }
    }
    this.write(path, next)
    this.notify()
    return { committed: true, snapshot: this.read(path) }
  }

  async removeOnDisconnect () {
    // The host disposes the entire demo when it closes; there is no server presence.
  }

  dispose () {
    this.disposed = true
    this.listeners.clear()
    this.tree = {}
  }

  private write (path: string, value: unknown) {
    const keys = parts(path)
    if (keys.length === 0) {
      this.tree = copy((value ?? {}) as Tree)
      return
    }
    let parent = this.tree
    for (const key of keys.slice(0, -1)) {
      const child = parent[key]
      if (!child || typeof child !== 'object') {
        parent[key] = {}
      }
      parent = parent[key] as Tree
    }
    const key = keys.at(-1)!
    if (value == null) {
      delete parent[key]
    } else {
      parent[key] = copy(value)
    }
  }

  private notify () {
    if (this.queued || this.disposed) {
      return
    }
    this.queued = true
    queueMicrotask(() => {
      this.queued = false
      for (const listener of this.listeners) {
        const next = this.read(listener.path)
        const serialized = JSON.stringify(next.val())
        if (serialized === listener.last) {
          continue
        }
        listener.last = serialized
        listener.callback(next)
      }
    })
  }
}
