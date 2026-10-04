import type { RoomDatabase, RoomSnapshot } from '@/data/roomDatabase'
import { MemoryRoomDatabase } from '@/data/memoryRoomDatabase'

interface DemoIdentity { userId: string, userName: string }
type DockMessage
  = | { type: 'hello' }
    | { type: 'state', state: Record<string, unknown>, identity: DemoIdentity }
    | { type: 'update', requestId: string, path: string, values: Record<string, unknown> }
    | { type: 'ack', requestId: string }
    | { type: 'closed' }

const channelName = (roomId: string) => `refinimo-demo:${roomId}`

/** The room tab is the sole writer. The popup forwards writes and receives snapshots. */
export function hostDemoDock (database: MemoryRoomDatabase, roomId: string, identity: DemoIdentity) {
  const channel = new BroadcastChannel(channelName(roomId))
  function sendState () {
    channel.postMessage({ type: 'state', state: database.read('').val(), identity } satisfies DockMessage)
  }
  channel.addEventListener('message', async (event: MessageEvent<DockMessage>) => {
    const message = event.data
    if (message.type === 'hello') {
      sendState()
    }
    if (message.type === 'update' && message.path === `rooms/${roomId}`) {
      await database.update(message.path, message.values)
      sendState()
      channel.postMessage({ type: 'ack', requestId: message.requestId } satisfies DockMessage)
    }
  })
  const unsubscribe = database.subscribe('', sendState)
  return () => {
    unsubscribe()
    channel.postMessage({ type: 'closed' } satisfies DockMessage)
    channel.close()
  }
}

export function connectDemoDock (roomId: string, onClose: () => void) {
  const channel = new BroadcastChannel(channelName(roomId))
  const cache = new MemoryRoomDatabase()
  const pending = new Map<string, { resolve: () => void, reject: (error: Error) => void, timer: ReturnType<typeof setTimeout> }>()
  let readyResolve: (identity: DemoIdentity) => void
  let readyReject: (error: Error) => void
  const ready = new Promise<DemoIdentity>((resolve, reject) => {
    readyResolve = resolve
    readyReject = reject
  })
  const timeout = setTimeout(() => readyReject(new Error('This demo has ended. Start a new demo from the overview.')), 6000)
  let disposed = false
  channel.addEventListener('message', (event: MessageEvent<DockMessage>) => {
    const message = event.data
    switch (message.type) {
      case 'state': {
        void cache.set('', message.state)
        clearTimeout(timeout)
        readyResolve(message.identity)

        break
      }
      case 'ack': {
        const request = pending.get(message.requestId)
        if (request) {
          clearTimeout(request.timer)
          request.resolve()
          pending.delete(message.requestId)
        }

        break
      }
      case 'closed': {
        dispose()
        onClose()

        break
      }
    // No default
    }
  })

  function dispose () {
    if (disposed) {
      return
    }
    disposed = true
    clearTimeout(timeout)
    readyReject(new Error('This demo has ended.'))
    for (const request of pending.values()) {
      clearTimeout(request.timer)
      request.reject(new Error('This demo has ended.'))
    }
    pending.clear()
    channel.close()
    cache.dispose()
  }

  const database: RoomDatabase = {
    subscribe: (path: string, listener: (snapshot: RoomSnapshot) => void) => cache.subscribe(path, listener),
    update: (path, values) => new Promise<void>((resolve, reject) => {
      if (disposed) {
        reject(new Error('This demo has ended.'))
        return
      }
      const requestId = crypto.randomUUID()
      const timer = setTimeout(() => {
        pending.delete(requestId)
        reject(new Error('The demo room is no longer responding.'))
      }, 6000)
      pending.set(requestId, { resolve, reject, timer })
      channel.postMessage({ type: 'update', requestId, path, values } satisfies DockMessage)
    }),
    // The real voting dock only updates votes. All round transactions run in the host.
    set: async () => {
      throw new Error('Manage this demo from its room window.')
    },
    transaction: async () => {
      throw new Error('Manage this demo from its room window.')
    },
    removeOnDisconnect: async () => {},
  }
  channel.postMessage({ type: 'hello' } satisfies DockMessage)
  return { database, ready, dispose }
}
