import type { MemoryRoomDatabase } from '@/data/memoryRoomDatabase'
import type { RoomRecord } from '@/types/room'
import { buildConsoleLogAppendUpdates, buildConsoleLogEntry } from '@/utils/roomConsoleLog'
import { buildVoteUpdates, canParticipantVote, getVoteOptions } from '@/utils/roomVoting'

/** Only the teammates are simulated. Round management stays in the real room page. */
export function startSimulatedPlayers (
  database: MemoryRoomDatabase,
  roomId: string,
  botIds: string[],
  visitorId: string,
  random = Math.random,
) {
  const path = `rooms/${roomId}`
  const pending = new Map<string, ReturnType<typeof setTimeout>>()
  let generation = ''
  let leaderTimer: ReturnType<typeof setTimeout> | undefined
  let delegatedLeader: string | null = null

  function cancelVotes () {
    for (const timer of pending.values()) {
      clearTimeout(timer)
    }
    pending.clear()
  }

  function canVote (room: RoomRecord, id: string) {
    return !room.settings?.showVotes
      && room.roundParticipants?.[id]?.vote == null
      && canParticipantVote(room, id)
  }

  const unsubscribe = database.subscribe(path, snapshot => {
    const room = snapshot.val() as RoomRecord | null
    if (!room) {
      cancelVotes()
      return
    }
    const round = room.roundNumber ?? 1
    const nextGeneration = JSON.stringify([
      round,
      room.consoleLog?.[`round-${round}-0000-system`]?.createdAt,
      getVoteOptions(room.settings),
      room.currentTask,
    ])
    if (generation !== nextGeneration) {
      cancelVotes()
      generation = nextGeneration
    }

    for (const [index, id] of botIds.entries()) {
      if (!canVote(room, id)) {
        clearTimeout(pending.get(id))
        pending.delete(id)
        continue
      }
      if (pending.has(id)) {
        continue
      }
      const scheduledGeneration = generation
      pending.set(id, setTimeout(() => {
        pending.delete(id)
        const current = database.read(path).val() as RoomRecord | null
        if (!current || generation !== scheduledGeneration || !canVote(current, id)) {
          return
        }
        const options = getVoteOptions(current.settings).filter(value => value !== '?' && value !== '☕')
        const vote = options[Math.floor(random() * Math.min(options.length, 7))]
        void database.update(path, buildVoteUpdates(current, id, current.roundParticipants![id].name, vote))
      }, 1400 + index * 650 + Math.floor(random() * 2300)))
    }

    // Let visitors try delegation without stranding them behind a simulated leader.
    const leader = room.settings?.leaderModeEnabled && botIds.includes(room.leaderUserId ?? '')
      ? room.leaderUserId!
      : null
    if (leader !== delegatedLeader) {
      clearTimeout(leaderTimer)
      delegatedLeader = leader
      if (leader) {
        leaderTimer = setTimeout(() => {
          const current = database.read(path).val() as RoomRecord | null
          if (!current || current.leaderUserId !== leader || !current.settings?.leaderModeEnabled) {
            return
          }
          const name = current.roundParticipants?.[leader]?.name ?? 'Your teammate'
          const entry = buildConsoleLogEntry('info', `${name} handed leadership back to you.`, Date.now(), current.roundNumber ?? 1)
          void database.update(path, {
            leaderUserId: visitorId,
            ...buildConsoleLogAppendUpdates([entry], current.consoleLog),
          })
        }, 2000)
      }
    }
  })

  return () => {
    unsubscribe()
    cancelVotes()
    clearTimeout(leaderTimer)
  }
}
