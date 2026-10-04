import type { RoomRecord, RoomSettings, RoomUser, VoteValue } from '@/types/room'
import { buildConsoleLogAppendUpdates, buildVoteConsoleLogEntry } from './roomConsoleLog'

const PRESET_DECKS: Record<string, VoteValue[]> = {
  'fibonacci': [0, 1, 2, 3, 5, 8, 13, 21, 34, 55],
  'modified-fibonacci': [0, 1, 2, 3, 5, 8, 13, 20, 40, 100],
  'linear': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15],
  'power-of-2': [1, 2, 4, 8, 16, 32, 64, 128],
  'tshirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
}

export function getVoteOptions (settings?: RoomSettings): VoteValue[] {
  let values: VoteValue[] = []
  if (settings?.deck === 'custom') {
    values = (settings.customDeck ?? '').split(',').flatMap(part => {
      const value = part.trim()
      if (!value) {
        return []
      }
      const number = Number(value)
      return [Number.isNaN(number) ? value : number]
    })
  }
  if (values.length === 0) {
    values = [...(PRESET_DECKS[settings?.deck ?? 'fibonacci'] ?? PRESET_DECKS.fibonacci)]
  }
  if (settings?.specialQuestion !== false) {
    values.push('?')
  }
  if (settings?.specialCoffee !== false) {
    values.push('☕')
  }
  return values
}

export function canParticipantVote (room: RoomRecord | null, userId: string | null, users: Record<string, RoomUser> = {}) {
  return !!room && !!userId
    && !!(room.roundParticipants ?? users)[userId]
    && (!room.settings?.showVotes || room.settings?.allowVoteChangesAfterReveal === true)
    && (!room.roundEditLock || room.roundEditLock.userId === userId)
    && (!room.settings?.taskInformationEnabled || !!room.currentTask)
}

export function buildVoteUpdates (room: RoomRecord, userId: string, userName: string, value: VoteValue, now = Date.now()) {
  const previousVote = room.roundParticipants?.[userId]?.vote ?? null
  const newVote = previousVote === value ? null : value
  const entry = buildVoteConsoleLogEntry(previousVote, newVote, now, room.roundNumber ?? 1, userId, userName)
  return {
    [`roundParticipants/${userId}/vote`]: newVote,
    lastActivity: now,
    ...buildConsoleLogAppendUpdates([entry], room.consoleLog),
  }
}
