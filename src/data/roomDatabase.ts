import type { Database, DataSnapshot } from 'firebase/database'
import * as firebase from 'firebase/database'

export type RoomSnapshot = Pick<DataSnapshot, 'val' | 'exists'>
export type RoomTransaction = Parameters<typeof firebase.runTransaction>[1]
export interface RoomTransactionResult {
  committed: boolean
  snapshot: RoomSnapshot
}

/** The persistence operations used by a room, independent of where it is hosted. */
export interface RoomDatabase {
  subscribe: (path: string, listener: (snapshot: RoomSnapshot) => void) => () => void
  set: (path: string, value: unknown) => Promise<void>
  update: (path: string, values: Record<string, unknown>) => Promise<void>
  transaction: (path: string, change: RoomTransaction) => Promise<RoomTransactionResult>
  removeOnDisconnect: (path: string) => Promise<void>
}

export function firebaseRoomDatabase (database: Database): RoomDatabase {
  return {
    subscribe: (path, listener) => firebase.onValue(firebase.ref(database, path), listener),
    set: (path, value) => firebase.set(firebase.ref(database, path), value),
    update: (path, values) => firebase.update(firebase.ref(database, path), values),
    transaction: (path, change) => firebase.runTransaction(firebase.ref(database, path), change),
    removeOnDisconnect: path => firebase.onDisconnect(firebase.ref(database, path)).remove(),
  }
}

interface RoomReference {
  database: RoomDatabase
  path: string
}

export function ref (database: RoomDatabase, path: string): RoomReference {
  return { database, path }
}

export function onValue (reference: RoomReference, listener: (snapshot: RoomSnapshot) => void) {
  return reference.database.subscribe(reference.path, listener)
}

export function set (reference: RoomReference, value: unknown) {
  return reference.database.set(reference.path, value)
}

export function update (reference: RoomReference, values: Record<string, unknown>) {
  return reference.database.update(reference.path, values)
}

export function remove (reference: RoomReference) {
  return set(reference, null)
}

export function runTransaction (reference: RoomReference, change: RoomTransaction) {
  return reference.database.transaction(reference.path, change)
}

export function onDisconnect (reference: RoomReference) {
  return { remove: () => reference.database.removeOnDisconnect(reference.path) }
}
