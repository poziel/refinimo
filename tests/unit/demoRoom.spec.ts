import type { RoomRecord } from '@/types/room'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRoomDatabase } from '@/data/memoryRoomDatabase'
import { createDemoRoom, DEMO_PLAYERS } from '@/demo/demoPlayers'
import { startSimulatedPlayers } from '@/demo/simulatedPlayers'
import { AVATAR_STYLES } from '@/utils/avatarStyles'
import { buildRoundConsoleLogMap } from '@/utils/roomConsoleLog'
import { buildVoteUpdates, getVoteOptions } from '@/utils/roomVoting'

describe('Demo room data and teammates', () => {
  afterEach(() => vi.useRealTimers())

  it('defines one hundred distinct characters with supported styles and fixed avatar colors', () => {
    expect(DEMO_PLAYERS).toHaveLength(100)
    expect(new Set(DEMO_PLAYERS.map(player => player.name.toLowerCase())).size).toBe(100)
    expect(new Set(DEMO_PLAYERS.map(player => player.avatarStyle)).size).toBeGreaterThan(1)
    const supportedStyles = new Set(AVATAR_STYLES.map(style => style.id))
    for (const [index, player] of DEMO_PLAYERS.entries()) {
      expect(supportedStyles.has(player.avatarStyle)).toBe(true)
      expect(player.color).toMatch(/^#[\da-f]{6}$/i)
      let draws = 0
      const { room, botIds } = createDemoRoom('visitor', 'You', () => draws++ === 0 ? 0 : (index + 0.5) / 100)
      const bot = room.users[botIds[0]]
      expect(bot.name).toBe(player.name)
      const avatar = new URL(bot.avatarUrl!)
      expect(avatar.hostname).toBe('api.dicebear.com')
      expect(avatar.pathname).toBe(`/10.x/${player.avatarStyle}/svg`)
      expect(avatar.searchParams.get('seed')).toBe(player.name)
      expect(avatar.searchParams.get('backgroundColor')).toBe(player.color.slice(1))
    }
  })

  it('selects one to eight unique teammates, excludes the visitor name, and mixes styles', () => {
    for (const [random, count] of [[0, 1], [0.999, 8]] as const) {
      const { room, botIds } = createDemoRoom('visitor', ' aLeX ', () => random)
      expect(botIds).toHaveLength(count)
      expect(Object.keys(room.users)).toHaveLength(count + 1)
      const bots = botIds.map(id => room.users[id])
      expect(new Set(bots.map(bot => bot.name)).size).toBe(count)
      expect(bots.every(bot => bot.name !== 'Alex')).toBe(true)
      expect(new Set(bots.map(bot => bot.avatarUrl)).size).toBe(count)
      if (count > 1) {
        expect(new Set(bots.map(bot => new URL(bot.avatarUrl!).pathname)).size).toBeGreaterThan(1)
      }
    }
  })

  it('favors four and five teammates, with three and eight the least likely sizes', () => {
    const frequencies = Array.from({ length: 8 }, () => 0)
    // Cover the full random interval evenly, so probability checks never flake.
    for (let sample = 0; sample < 1000; sample++) {
      const { botIds, room } = createDemoRoom('visitor', 'You', () => (sample + 0.5) / 1000)
      frequencies[botIds.length - 1]++
      if (botIds.length > 1) {
        const styles = botIds.map(id => new URL(room.users[id].avatarUrl!).pathname)
        expect(new Set(styles).size).toBeGreaterThan(1)
      }
    }
    expect(frequencies.every(frequency => frequency > 0)).toBe(true)
    const mostCommon = Math.max(...frequencies)
    const leastCommon = Math.min(...frequencies)
    expect(frequencies[3]).toBe(mostCommon)
    expect(frequencies[4]).toBe(mostCommon)
    expect(frequencies[3] + frequencies[4]).toBeGreaterThan(500)
    expect(frequencies[2]).toBe(leastCommon)
    expect(frequencies[7]).toBe(leastCommon)
    for (const index of [0, 1, 5, 6]) {
      expect(frequencies[index]).toBeGreaterThan(leastCommon)
      expect(frequencies[index]).toBeLessThan(mostCommon)
    }
  })

  it('gives the visitor an equal chance at every seat for every team size', () => {
    const teamSamples = [0, 0.07, 0.13, 0.2, 0.5, 0.8, 0.91, 0.99]
    for (const [index, teamSample] of teamSamples.entries()) {
      const botCount = index + 1
      const frequencies = Array.from({ length: botCount + 1 }, () => 0)
      const samples = frequencies.length * 10
      for (let sample = 0; sample < samples; sample++) {
        let draws = 0
        const random = () => {
          const draw = draws++
          if (draw === 0) {
            return teamSample
          }
          if (draw === botCount + 1) {
            return (sample + 0.5) / samples
          }
          return 0.5
        }
        const { room, botIds } = createDemoRoom('visitor', 'Demo', random)
        expect(botIds).toHaveLength(botCount)
        const order = Object.entries(room.users).toSorted(([, a], [, b]) => a.joinedAt - b.joinedAt)
        frequencies[order.findIndex(([id]) => id === 'visitor')]++
        expect(new Set(order.map(([, player]) => player.joinedAt)).size).toBe(botCount + 1)
        expect(Object.keys(room.users)).toEqual(order.map(([id]) => id))
        expect(room.roundParticipants).toEqual(room.users)
      }
      expect(frequencies).toEqual(Array.from({ length: botCount + 1 }, () => 10))
    }
  })

  it('publishes atomic updates, deletes values, aborts transactions, and isolates snapshots', async () => {
    const database = new MemoryRoomDatabase({ rooms: { a: { round: 1, vote: 5 } } })
    const listener = vi.fn()
    const stop = database.subscribe('rooms/a', listener)
    await Promise.resolve()
    await database.update('rooms/a', { round: 2, vote: null })
    expect(listener.mock.calls.map(([value]) => value.val())).toEqual([{ round: 1, vote: 5 }, { round: 2 }])
    const aborted = await database.transaction('rooms/a', () => undefined)
    expect(aborted.committed).toBe(false)
    await Promise.all([
      database.transaction('rooms/a/round', n => n + 1),
      database.transaction('rooms/a/round', n => n + 1),
    ])
    expect(database.read('rooms/a/round').val()).toBe(4)
    const copy = database.read('rooms/a').val()
    copy.round = 999
    expect(database.read('rooms/a/round').val()).toBe(4)
    stop()
    listener.mockClear()
    await database.set('rooms/a', null)
    expect(database.read('rooms/a').exists()).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })

  it('delays votes, respects reveals and task locks, and resumes after a reset with the chosen deck', async () => {
    vi.useFakeTimers()
    const { room, botIds } = createDemoRoom('visitor', 'You', () => 0.2)
    const database = new MemoryRoomDatabase({ rooms: { practice: room } })
    const stop = startSimulatedPlayers(database, 'practice', botIds, 'visitor', () => 0)
    const read = () => database.read('rooms/practice').val() as RoomRecord
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(1000)
    expect(botIds.every(id => read().roundParticipants![id].vote == null)).toBe(true)
    await vi.advanceTimersByTimeAsync(4000)
    expect(botIds.every(id => read().roundParticipants![id].vote != null)).toBe(true)

    await database.update('rooms/practice', {
      'roundParticipants': room.users,
      'consoleLog': buildRoundConsoleLogMap(1, room.users, Date.now(), 'reset'),
      'settings/showVotes': true,
    })
    await vi.advanceTimersByTimeAsync(10_000)
    expect(botIds.every(id => read().roundParticipants![id].vote == null)).toBe(true)
    await database.update('rooms/practice', {
      'settings/showVotes': false,
      'settings/deck': 'custom',
      'settings/customDeck': 'Small, Medium, Large',
      'settings/taskInformationEnabled': true,
    })
    await vi.advanceTimersByTimeAsync(10_000)
    expect(botIds.every(id => read().roundParticipants![id].vote == null)).toBe(true)
    await database.update('rooms/practice', { currentTask: { title: 'A task' }, roundEditLock: { userId: 'visitor' } })
    await vi.advanceTimersByTimeAsync(10_000)
    expect(botIds.every(id => read().roundParticipants![id].vote == null)).toBe(true)
    await database.update('rooms/practice', { roundEditLock: null })
    await vi.advanceTimersByTimeAsync(5000)
    expect(botIds.map(id => read().roundParticipants![id].vote)).toEqual(botIds.map(() => 'Small'))

    await database.update('rooms/practice', { roundParticipants: room.users })
    stop()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(botIds.every(id => read().roundParticipants![id].vote == null)).toBe(true)
    database.dispose()
  })

  it('cancels stale votes when a round or deck changes and returns delegated leadership', async () => {
    vi.useFakeTimers()
    const { room, botIds } = createDemoRoom('visitor', 'You', () => 0)
    const database = new MemoryRoomDatabase({ rooms: { practice: room } })
    const stop = startSimulatedPlayers(database, 'practice', botIds, 'visitor', () => 0)
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(1000)
    await database.update('rooms/practice', {
      'roundNumber': 2,
      'settings/deck': 'custom',
      'settings/customDeck': 'Only',
      'settings/leaderModeEnabled': true,
      'leaderUserId': botIds[0],
    })
    await vi.advanceTimersByTimeAsync(500)
    expect(database.read('rooms/practice/roundParticipants').val()).toEqual(room.users)
    await vi.advanceTimersByTimeAsync(4000)
    for (const id of botIds) {
      expect(database.read(`rooms/practice/roundParticipants/${id}/vote`).val()).toBe('Only')
    }
    expect(database.read('rooms/practice/leaderUserId').val()).toBe('visitor')
    stop()
  })

  it('uses shared vote semantics for zero, deselection, and custom deck fallback', () => {
    const { room } = createDemoRoom('visitor', 'You', () => 0)
    room.roundParticipants!.visitor.vote = 0
    expect(buildVoteUpdates(room, 'visitor', 'You', 0)['roundParticipants/visitor/vote']).toBeNull()
    expect(buildVoteUpdates(room, 'visitor', 'You', 5)['roundParticipants/visitor/vote']).toBe(5)
    expect(getVoteOptions({ deck: 'custom', customDeck: ' , ', specialQuestion: false, specialCoffee: false })).toEqual(getVoteOptions({ specialQuestion: false, specialCoffee: false }))
  })
})
