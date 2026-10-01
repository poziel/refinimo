import type { RoomDatabase } from '@/data/roomDatabase'
import type { InjectionKey, Ref } from 'vue'

export const DEMO_VISITOR_NAME = 'Demo'

export interface DemoContext {
  database: RoomDatabase
  roomId: string
  userId: string
  userName: Ref<string>
  dockActive: Ref<boolean>
  toggleDock: () => void
}

export const demoContextKey: InjectionKey<DemoContext> = Symbol('demo-room')
