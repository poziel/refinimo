import type { RoomRecord, RoomUser, VoteValue } from '@/types/room'
import { storeToRefs } from 'pinia'
import { computed, type ComputedRef, inject, ref, type Ref } from 'vue'
import { ref as dbRef, firebaseRoomDatabase, onValue, update } from '@/data/roomDatabase'
import { demoContextKey } from '@/demo/demoContext'
import { useConfigStore } from '@/stores/config'
import { buildVoteUpdates, canParticipantVote, getVoteOptions } from '@/utils/roomVoting'

type ConsensusState = 'consensus' | 'close' | 'split'

interface RoundStats {
  avg: number | null
  median: VoteValue | null
  closest: VoteValue | null
  min: VoteValue | null
  max: VoteValue | null
  spread: number | null
  counts: Record<string, number>
  maxCount: number
  total: number
  numericTotal: number
  ordinalTotal: number
  consensus: ConsensusState
}

interface RoomVotingDockOptions {
  userId?: ComputedRef<string | null> | Ref<string | null>
  userName?: ComputedRef<string> | Ref<string>
}

function countVotes (votes: readonly VoteValue[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const vote of votes) {
    const key = String(vote)
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

function formatNum (num: number | null | undefined): string {
  if (num == null) {
    return '-'
  }
  return Number.isInteger(num) ? String(num) : String(Number.parseFloat(num.toFixed(2)))
}

export function useRoomVotingDock (options: RoomVotingDockOptions = {}) {
  const configStore = useConfigStore()
  const { userName } = storeToRefs(configStore)

  const currentRoom = ref<RoomRecord | null>(null)
  const roomUsers = ref<Record<string, RoomUser>>({})
  const roomMissing = ref(false)
  const activeRoomId = ref<string | null>(null)
  const demo = inject(demoContextKey, null)
  const db = computed(() => {
    if (demo) {
      return demo.database
    }
    const database = configStore.getDb()
    return database ? firebaseRoomDatabase(database) : null
  })

  let unsubscribeRoom: (() => void) | null = null
  let unsubscribeUsers: (() => void) | null = null

  const showVotes = computed(() => currentRoom.value?.settings?.showVotes === true)
  const historyEnabled = computed(() => currentRoom.value?.settings?.historyEnabled !== false)
  const allowVoteChangesAfterReveal = computed(() => currentRoom.value?.settings?.allowVoteChangesAfterReveal === true)
  const leaderModeEnabled = computed(() => currentRoom.value?.settings?.leaderModeEnabled === true)
  const taskInformationEnabled = computed(() => currentRoom.value?.settings?.taskInformationEnabled === true)
  const currentTask = computed(() => currentRoom.value?.currentTask ?? null)
  const committedVote = computed(() => currentRoom.value?.committedVote ?? null)
  const leaderUserId = computed(() => currentRoom.value?.leaderUserId ?? null)
  const effectiveUserId = computed(() => demo?.userId ?? options.userId?.value ?? configStore.userId)
  const effectiveUserName = computed(() => demo?.userName.value ?? options.userName?.value ?? userName.value)
  const isLeader = computed(() => !leaderModeEnabled.value || (!!effectiveUserId.value && leaderUserId.value === effectiveUserId.value))
  const isRoundLockedByOther = computed(() =>
    !!currentRoom.value?.roundEditLock
    && !!effectiveUserId.value
    && currentRoom.value.roundEditLock.userId !== effectiveUserId.value,
  )

  const activeRoundParticipants = computed<Record<string, RoomUser>>(() =>
    currentRoom.value?.roundParticipants ?? roomUsers.value,
  )
  const currentParticipant = computed(() =>
    effectiveUserId.value ? activeRoundParticipants.value[effectiveUserId.value] : undefined,
  )

  const voteOptions = computed(() => getVoteOptions(currentRoom.value?.settings))

  const orderedEstimateValues = computed(() => {
    const seen = new Set<string>()
    return voteOptions.value.filter(value => {
      if (value === '?' || value === '☕') {
        return false
      }
      const key = String(value)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  })
  const estimateOrderLookup = computed(() => {
    const lookup = new Map<string, number>()
    for (const [index, value] of orderedEstimateValues.value.entries()) {
      lookup.set(String(value), index + 1)
    }
    return lookup
  })
  const revealedVotes = computed(() =>
    Object.values(activeRoundParticipants.value)
      .map(user => user.vote)
      .filter((vote): vote is VoteValue => vote != null),
  )
  const displayVoteCounts = computed((): Record<string, number> | null => {
    if (!showVotes.value) {
      return null
    }
    const counts = countVotes(revealedVotes.value)
    return Object.keys(counts).length > 0 ? counts : null
  })
  const selectedVote = computed(() => currentParticipant.value?.vote ?? null)
  const canVoteInCurrentRound = computed(() => canParticipantVote(currentRoom.value, effectiveUserId.value, roomUsers.value))
  const canCommitFinalVote = computed(() => !leaderModeEnabled.value || isLeader.value)
  const voteActionHint = computed(() => {
    if (!currentParticipant.value) {
      return 'Join the room in the main window before voting here'
    }
    if (leaderModeEnabled.value && !isLeader.value) {
      return 'Waiting for the leader to manage this round'
    }
    if (isRoundLockedByOther.value) {
      return `${currentRoom.value?.roundEditLock?.userName ?? 'Another participant'} is entering task information`
    }
    if (taskInformationEnabled.value && !currentTask.value) {
      return 'Task information is required before anyone can vote'
    }
    if (showVotes.value && !allowVoteChangesAfterReveal.value) {
      return 'Voting is locked after reveal for this room'
    }
    return ''
  })

  const numericVotes = computed(() =>
    revealedVotes.value.filter((vote): vote is number => typeof vote === 'number'),
  )
  const ordinalVotes = computed(() =>
    revealedVotes.value.flatMap(vote => {
      const position = estimateOrderLookup.value.get(String(vote))
      return position == null ? [] : [{ vote, position }]
    }),
  )
  const averageVote = computed(() => {
    if (numericVotes.value.length === 0) {
      return null
    }
    const sum = numericVotes.value.reduce((acc, val) => acc + val, 0)
    return Number.parseFloat((sum / numericVotes.value.length).toFixed(2))
  })
  const medianVote = computed<VoteValue | null>(() => {
    if (ordinalVotes.value.length === 0) {
      return null
    }
    const sorted = ordinalVotes.value.toSorted((a, b) => a.position - b.position)
    const mid = Math.floor(sorted.length / 2)
    return sorted[mid]?.vote ?? null
  })
  const stats = computed<RoundStats | null>(() => {
    if (!showVotes.value || revealedVotes.value.length === 0) {
      return null
    }

    const counts = countVotes(revealedVotes.value)
    const uniqueVoteCount = Object.keys(counts).length
    const maxCount = Math.max(...Object.values(counts))
    const ordinal = ordinalVotes.value
    const ordinalPositions = ordinal.map(vote => vote.position)
    const minPosition = ordinalPositions.length > 0 ? Math.min(...ordinalPositions) : null
    const maxPosition = ordinalPositions.length > 0 ? Math.max(...ordinalPositions) : null
    const min = minPosition == null ? null : (orderedEstimateValues.value[minPosition - 1] ?? null)
    const max = maxPosition == null ? null : (orderedEstimateValues.value[maxPosition - 1] ?? null)
    const spread = minPosition != null && maxPosition != null ? maxPosition - minPosition : null

    let closest: VoteValue | null = null
    if (ordinal.length > 0) {
      const averagePosition = ordinal.reduce((acc, vote) => acc + vote.position, 0) / ordinal.length
      closest = ordinal[0]?.vote ?? null
      let bestDistance = Math.abs(averagePosition - (ordinal[0]?.position ?? 0))
      let bestPosition = ordinal[0]?.position ?? 0
      for (const vote of ordinal) {
        const distance = Math.abs(averagePosition - vote.position)
        if (distance < bestDistance - 1e-9) {
          closest = vote.vote
          bestDistance = distance
          bestPosition = vote.position
        } else if (Math.abs(distance - bestDistance) < 1e-9 && vote.position > bestPosition) {
          closest = vote.vote
          bestPosition = vote.position
        }
      }
    }

    const isCloseOrdinalVote = ordinal.length === revealedVotes.value.length
      && spread != null
      && spread <= 1
      && uniqueVoteCount <= 2

    return {
      avg: averageVote.value,
      median: medianVote.value,
      closest,
      min,
      max,
      spread,
      counts,
      maxCount,
      total: revealedVotes.value.length,
      numericTotal: numericVotes.value.length,
      ordinalTotal: ordinal.length,
      consensus: uniqueVoteCount === 1 ? 'consensus' : (isCloseOrdinalVote ? 'close' : 'split'),
    }
  })

  function subscribeToRoom (roomId: string | null) {
    unsubscribeRoom?.()
    unsubscribeUsers?.()
    unsubscribeRoom = null
    unsubscribeUsers = null
    activeRoomId.value = roomId
    currentRoom.value = null
    roomUsers.value = {}
    roomMissing.value = false

    if (!roomId || !db.value) {
      return
    }

    unsubscribeRoom = onValue(dbRef(db.value, `rooms/${roomId}`), snapshot => {
      const data = snapshot.val()
      currentRoom.value = data
      roomMissing.value = !data
    })

    unsubscribeUsers = onValue(dbRef(db.value, `rooms/${roomId}/users`), snapshot => {
      roomUsers.value = snapshot.val() || {}
    })
  }

  function stop () {
    unsubscribeRoom?.()
    unsubscribeUsers?.()
    unsubscribeRoom = null
    unsubscribeUsers = null
  }

  function castVote (value: VoteValue) {
    if (!db.value || !activeRoomId.value || !effectiveUserId.value || !canVoteInCurrentRound.value) {
      return
    }

    const currentPlayerName = currentParticipant.value?.name ?? effectiveUserName.value ?? 'Anonymous'
    update(dbRef(db.value, `rooms/${activeRoomId.value}`), buildVoteUpdates(
      { ...currentRoom.value!, roundParticipants: activeRoundParticipants.value }, effectiveUserId.value, currentPlayerName, value,
    )).catch(console.error)
  }

  function commitVote (value: string) {
    if (!db.value || !activeRoomId.value || !canCommitFinalVote.value) {
      return
    }
    update(dbRef(db.value, `rooms/${activeRoomId.value}`), { committedVote: value, lastActivity: Date.now() }).catch(console.error)
  }

  return {
    activeRoomId,
    canCommitFinalVote,
    canVoteInCurrentRound,
    castVote,
    commitVote,
    committedVote,
    currentRoom,
    displayVoteCounts,
    formatNum,
    historyEnabled,
    roomMissing,
    selectedVote,
    showVotes,
    stats,
    stop,
    subscribeToRoom,
    userName: effectiveUserName,
    voteActionHint,
    voteOptions,
  }
}
