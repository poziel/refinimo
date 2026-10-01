<template>
  <template v-if="currentRoom && !!userName">
    <div class="shell" data-test-id="room-shell">
      <!-- Backdrop for mobile sidebar overlay -->
      <div v-if="sidePanelEnabled && historyPanelOpen" class="panel-backdrop" @click="historyPanelOpen = false" />

      <RoomSidePanel
        v-if="sidePanelEnabled"
        v-model:open="historyPanelOpen"
        :can-restore-history="canRestoreHistoryEntry"
        :current-task="currentTask"
        :history="sessionHistory"
        :history-enabled="historyEnabled"
        :restore-history-title="restoreHistoryActionTitle"
        :task-information-enabled="taskInfoVisible"
        @restore-history="restoreHistoryEntry"
      />

      <main class="main">
        <div class="main-head">
          <v-btn
            v-if="sidePanelEnabled"
            :aria-label="historyPanelOpen ? 'Close panel' : 'Open room panel'"
            class="icon-btn mobile-panel-btn"
            data-test-id="room-toggle-panel"
            density="compact"
            icon
            :title="historyPanelOpen ? 'Close panel (P)' : 'Open room panel (P)'"
            variant="text"
            @click="roomCommands.toggleSidePanel()"
          >
            <v-icon :icon="historyPanelOpen ? 'mdi-backburger' : 'mdi-menu'" size="16" />
          </v-btn>

          <v-btn
            :aria-label="demo ? 'Exit demo' : 'Back to lobby'"
            class="icon-btn home-btn"
            data-test-id="room-back-to-lobby"
            density="compact"
            icon
            :title="demo ? 'Exit demo (Esc)' : 'Back to lobby (Esc)'"
            variant="text"
            @click="roomCommands.goToLobby()"
          >
            <v-icon icon="mdi-home-outline" size="16" />
          </v-btn>

          <div class="room-title-row">
            <p class="room-name-label" data-test-id="room-name">{{ currentRoom.name }}</p>

            <span aria-hidden="true" class="room-title-separator">•</span>

            <a
              v-if="currentTask?.title && currentTask?.url"
              class="round-counter round-title-link"
              :href="currentTask.url"
              rel="noreferrer"
              target="_blank"
              :title="currentTask.url"
            >
              {{ currentTask.title }}
            </a>

            <span v-else class="round-counter" :class="{ 'round-title-text': !!currentTask?.title }" data-test-id="room-round-label">
              {{ currentRoundLabel }}
            </span>
          </div>

          <div v-if="showVotes && committedVote" class="round-final-score">
            <span>Final</span>
            <strong>{{ committedVote }}</strong>
          </div>

          <div class="progress-pill">
            <span class="progress-dots">
              <span
                v-for="player in sortedRoomUsers"
                :key="player.userId"
                class="pdot"
                :class="{ done: player.vote != null, connected: player.isConnected }"
                :title="player.name"
              />
            </span>

            <span class="vote-count" data-test-id="room-vote-count">{{ votedCount }}/{{ totalPlayers }} voted</span>
          </div>

          <v-btn
            v-if="configStore.viewMode === 'simple'"
            :aria-label="phoneDockActive ? 'Disconnect phone voting dock' : 'Open voting dock on phone'"
            class="icon-btn"
            :class="{ 'icon-btn-active': phoneDockActive }"
            data-test-id="simple-vote-dock-phone"
            density="compact"
            icon
            :title="phoneDockActive ? 'Disconnect phone voting dock' : 'Open voting dock on phone'"
            variant="text"
            @click="openPhoneDockQr"
          >
            <v-icon :icon="phoneDockActive ? 'mdi-cellphone-off' : 'mdi-qrcode'" size="16" />
          </v-btn>

          <v-btn
            v-if="configStore.viewMode === 'simple'"
            :aria-label="windowDockActive ? 'Close voting dock window' : 'Open voting dock in a window'"
            class="icon-btn"
            :class="{ 'icon-btn-active': windowDockActive }"
            data-test-id="simple-vote-dock-external"
            density="compact"
            icon
            :title="windowDockActive ? 'Close voting dock window (Ctrl+Space)' : 'Open voting dock in a window (Ctrl+Space)'"
            variant="text"
            @click="toggleExternalDock"
          >
            <v-icon :icon="windowDockActive ? 'mdi-monitor-off' : 'mdi-open-in-new'" size="16" />
          </v-btn>

          <v-btn
            v-if="taskInformationEnabled && currentTask"
            aria-label="Edit task information"
            class="icon-btn"
            data-test-id="room-edit-task"
            density="compact"
            :disabled="!canEditCurrentTask"
            icon
            :title="editTaskActionTitle"
            variant="text"
            @click="startTaskInfoFlow('current')"
          >
            <v-icon icon="mdi-pencil-outline" size="16" />
          </v-btn>

          <v-btn
            aria-label="Room settings"
            class="icon-btn"
            data-test-id="room-open-settings"
            density="compact"
            :disabled="leaderModeEnabled && !isLeader"
            icon
            :title="leaderModeEnabled && !isLeader ? 'Only the leader can change room settings' : 'Room settings (Ctrl+É)'"
            variant="text"
            @click="roomConfigOpen = true"
          >
            <v-icon icon="mdi-tune" size="16" />
          </v-btn>

          <v-btn
            :aria-label="demo ? 'Share demo link' : shareCopied ? 'Copied!' : 'Share room link'"
            class="icon-btn"
            data-test-id="room-share-link"
            density="compact"
            :disabled="!firebaseConfig && !demo"
            icon
            :title="demo ? 'Copy a link to try the demo' : shareCopied ? 'Copied!' : 'Copy room + config link'"
            variant="text"
            @click="roomCommands.copyRoomLink()"
          >
            <v-icon :icon="shareCopied ? 'mdi-check' : 'mdi-share-variant'" size="16" />
          </v-btn>
        </div>

        <div
          v-if="timerVisible"
          class="round-timer-strip"
          :class="{
            warning: timerWarningActive,
            'warning-pulse': timerWarningAnimationActive,
            expired: timerExpired,
            paused: roundTimer?.status === 'paused',
          }"
        >
          <div class="round-timer-strip-track">
            <span class="round-timer-strip-fill" :style="{ width: `${timerProgressPercent}%` }" />
          </div>

          <div class="round-timer-strip-meta">
            <span class="round-timer-strip-label">{{ timerLabel }}</span>
            <strong class="round-timer-strip-value">{{ timerDisplay }}</strong>
          </div>
        </div>

        <RoomConfigModal
          v-if="currentRoom"
          v-model="roomConfigOpen"
          :current-settings="{
            name: currentRoom.name,
            deck: currentRoom.settings?.deck ?? 'fibonacci',
            customDeck: currentRoom.settings?.customDeck ?? '',
            specialQuestion: currentRoom.settings?.specialQuestion !== false,
            specialCoffee: currentRoom.settings?.specialCoffee !== false,
            historyEnabled: currentRoom.settings?.historyEnabled !== false,
            allowVoteChangesAfterReveal: currentRoom.settings?.allowVoteChangesAfterReveal === true,
            leaderModeEnabled: currentRoom.settings?.leaderModeEnabled === true,
            taskInformationEnabled: currentRoom.settings?.taskInformationEnabled === true,
            timerEnabled: currentRoom.settings?.timerEnabled === true,
            timerMode: currentRoom.settings?.timerMode === 'manual' ? 'manual' : 'automatic',
            timerDurationSeconds: currentRoom.settings?.timerDurationSeconds ?? 300,
            timerAutoRevealEnabled: currentRoom.settings?.timerAutoRevealEnabled !== false,
            timerWarningEnabled: currentRoom.settings?.timerWarningEnabled === true,
            timerWarningType: currentRoom.settings?.timerWarningType === 'percentage' ? 'percentage' : 'seconds',
            timerWarningValue: currentRoom.settings?.timerWarningValue ?? 30,
            reactionsEnabled: currentRoom.settings?.reactionsEnabled === true,
            reactionEmojis: getReactionEmojis(currentRoom.settings?.reactionEmojis),
          }"
          @save="applyRoomConfig"
        />

        <TaskInfoModal
          v-model="taskInfoModalOpen"
          :initial-task="taskDraftInitialValue"
          :message="taskInfoModalMessage"
          :submit-label="taskInfoModalSubmitLabel"
          :title="taskInfoModalTitle"
          @save="saveTaskInformation"
        />

        <div
          class="room-display-stack"
          :class="{
            revealed: showVotes,
            'room-display-stack-simple': configStore.viewMode === 'simple',
          }"
        >
          <CardWallView
            v-if="configStore.viewMode === 'table'"
            :current-user-id="configStore.userId"
            :leader-user-id="leaderUserId"
            :players="sortedRoomUsers"
            :shaking-user-ids="shakingUserIds"
            :show-votes="showVotes"
            @open-player-menu="openPlayerMenu"
          />

          <SimpleResultsGrid
            v-if="configStore.viewMode === 'grid'"
            :current-user-id="configStore.userId"
            :leader-user-id="leaderUserId"
            :players="sortedRoomUsers"
            :shaking-user-ids="shakingUserIds"
            :show-votes="showVotes"
            @open-player-menu="openPlayerMenu"
          />

          <ConsoleRoomView
            v-if="configStore.viewMode === 'console'"
            :entries="consoleLogEntries"
            :players="sortedRoomUsers"
            :round-label="currentRoundLabel"
            :show-votes="showVotes"
            :total-players="totalPlayers"
            :voted-count="votedCount"
          />

          <GroupStatusView
            v-if="configStore.viewMode === 'group-status'"
            :current-user-id="configStore.userId"
            :leader-user-id="leaderUserId"
            :players="sortedRoomUsers"
            :shaking-user-ids="shakingUserIds"
            :show-votes="showVotes"
            :total-players="totalPlayers"
            :voted-count="votedCount"
            @open-player-menu="openPlayerMenu"
          />

          <SimpleRoomView
            v-if="configStore.viewMode === 'simple'"
            :can-commit-vote="canCommitFinalVote"
            :can-vote="canVoteInCurrentRound"
            :committed-vote="committedVote"
            :current-user-id="configStore.userId"
            :disabled-hint="voteActionHint"
            :display-vote-counts="displayVoteCounts"
            :external-dock-active="externalVotingDockActive"
            :history-enabled="historyEnabled"
            :leader-user-id="leaderUserId"
            :players="sortedRoomUsers"
            :selected-vote="selectedVote"
            :shaking-user-ids="shakingUserIds"
            :show-votes="showVotes"
            :stats="stats"
            :user-name="userName"
            :vote-options="voteOptions"
            @cast-vote="castVote"
            @commit-vote="onCommitVote"
            @open-player-menu="openPlayerMenu"
          />

          <Transition name="insights-strip">
            <RoundStatsPanel
              v-if="showVotes && configStore.viewMode !== 'simple'"
              :can-commit-vote="canCommitFinalVote"
              :committed-vote="committedVote"
              :display-vote-counts="displayVoteCounts"
              :history-enabled="historyEnabled"
              :stats="stats"
              :vote-options="voteOptions"
              @commit-vote="onCommitVote"
            />
          </Transition>
        </div>

        <FloatingReactions :reactions="floatingReactions" />

        <div
          class="action-row room-action-row"
          :class="{
            'room-action-row-revealed': showVotes,
            'room-action-row-simple': configStore.viewMode === 'simple',
          }"
        >
          <template v-if="taskInformationEnabled && !currentTask">
            <v-btn
              class="ui-btn ui-btn-primary"
              data-test-id="room-start-round"
              :disabled="!canStartTaskInfoFlow"
              prepend-icon="mdi-text-box-plus-outline"
              :title="roundActionTitle"
              variant="flat"
              @click="startTaskInfoFlow('current')"
            >
              Start round
            </v-btn>
          </template>

          <template v-else-if="!showVotes">
            <v-btn
              class="ui-btn ui-btn-primary"
              data-test-id="room-reveal-votes"
              :disabled="votedCount === 0 || !canManageRound"
              prepend-icon="mdi-eye"
              :title="roundActionTitle"
              variant="flat"
              @click="roomCommands.revealVotes()"
            >
              Reveal votes

              <span class="shortcut-hint">V</span>

              <span v-if="!allVoted" class="button-meta">
                {{ votedCount }}/{{ totalPlayers }}
              </span>
            </v-btn>

            <v-btn
              class="ui-btn ui-btn-ghost"
              data-test-id="room-reset-round"
              :disabled="!canManageRound"
              :title="roundActionTitle"
              variant="flat"
              @click="roomCommands.resetRound()"
            >
              Reset round

              <span class="shortcut-hint">B</span>
            </v-btn>
          </template>

          <template v-else-if="showVotes">
            <v-btn
              class="ui-btn ui-btn-ghost"
              data-test-id="room-hide-votes"
              :disabled="!canManageRound"
              prepend-icon="mdi-eye-off"
              :title="roundActionTitle"
              variant="flat"
              @click="roomCommands.hideVotes()"
            >
              Hide votes

              <span class="shortcut-hint">V</span>
            </v-btn>

            <v-btn
              class="ui-btn ui-btn-primary"
              data-test-id="room-next-round"
              :disabled="!canManageRound"
              :prepend-icon="historyEnabled ? 'mdi-arrow-right' : 'mdi-refresh'"
              :title="roundActionTitle"
              variant="flat"
              @click="roomCommands.advanceRound()"
            >
              {{ historyEnabled ? 'Next round' : 'New round' }}

              <span class="shortcut-hint">N</span>
            </v-btn>
          </template>
        </div>

        <div v-if="timerControlsVisible" class="timer-action-row">
          <v-btn
            v-if="canStartManualTimer"
            class="ui-btn ui-btn-primary"
            data-test-id="room-start-timer"
            prepend-icon="mdi-play"
            :title="roundActionTitle"
            variant="flat"
            @click="startManualRoundTimer"
          >
            Start timer

            <span class="shortcut-hint">C</span>
          </v-btn>

          <v-btn
            v-if="canPauseTimer"
            class="ui-btn ui-btn-ghost"
            data-test-id="room-pause-timer"
            prepend-icon="mdi-pause"
            :title="roundActionTitle"
            variant="flat"
            @click="pauseCurrentRoundTimer"
          >
            Pause timer

            <span class="shortcut-hint">C</span>
          </v-btn>

          <v-btn
            v-if="canResumeTimer"
            class="ui-btn ui-btn-ghost"
            data-test-id="room-resume-timer"
            prepend-icon="mdi-play"
            :title="roundActionTitle"
            variant="flat"
            @click="resumeCurrentRoundTimer"
          >
            Resume timer

            <span class="shortcut-hint">C</span>
          </v-btn>

          <v-btn
            v-if="canExtendTimer"
            class="ui-btn ui-btn-ghost"
            data-test-id="room-extend-timer"
            prepend-icon="mdi-timer-plus-outline"
            :title="roundActionTitle"
            variant="flat"
            @click="extendCurrentRoundTimer"
          >
            +10 sec

            <span class="shortcut-hint">X</span>
          </v-btn>

          <v-btn
            v-if="canRestartTimer"
            class="ui-btn ui-btn-ghost"
            data-test-id="room-restart-timer"
            prepend-icon="mdi-restart"
            :title="roundActionTitle"
            variant="flat"
            @click="restartCurrentRoundTimer"
          >
            Restart timer

            <span class="shortcut-hint">Z</span>
          </v-btn>
        </div>

        <AdvertisementSlot
          v-if="configStore.enableAds"
          placement="room-support"
        />

        <ReactionBar
          v-if="reactionsEnabled"
          :class="{ 'reaction-bar-simple': configStore.viewMode === 'simple' }"
          :reactions="reactionEmojis"
          @react="sendReaction"
        />

        <VoteDock
          v-if="!externalVotingDockActive && configStore.viewMode !== 'simple'"
          v-model:collapsed="dockCollapsed"
          :can-vote="canVoteInCurrentRound"
          :disabled-hint="voteActionHint"
          :external-dock-active="windowDockActive"
          :phone-dock-active="phoneDockActive"
          :selected-vote="selectedVote"
          :show-votes="showVotes"
          :user-name="userName"
          :vote-options="voteOptions"
          @cast-vote="castVote"
          @open-phone-dock="openPhoneDockQr"
          @toggle-external-dock="toggleExternalDock"
        />

        <div v-if="externalVotingDockActive && configStore.viewMode !== 'simple'" class="external-dock-return">
          <button class="external-dock-return-btn" type="button" @click="bringVotingDockBack">
            <v-icon icon="mdi-monitor-off" size="16" />
            Bring voting dock back

            <span class="shortcut-hint">Ctrl+Space</span>
          </button>
        </div>

        <div
          v-if="playerMenu"
          class="room-context-menu"
          :style="{ left: `${playerMenu.x}px`, top: `${playerMenu.y}px` }"
          @click.stop
        >
          <button
            class="room-context-menu-item"
            type="button"
            @click="transferLeadership(playerMenu.userId)"
          >
            Make {{ playerMenu.name }} leader
          </button>
        </div>
      </main>
    </div>

    <ConfettiBurst
      v-if="showConfetti"
      :pieces="confettiPieces"
    />
  </template>

  <v-container v-else class="setup-screen" fluid>
    <v-card class="setup-card" flat>
      <div class="kicker">Room</div>
      <h1 class="setup-title">{{ roomNotFound ? 'Room not found' : 'Loading room' }}</h1>

      <p class="setup-desc">
        {{ roomNotFound ? 'This room could not be found. You will be redirected shortly.' : 'Connecting to the room.' }}
      </p>
    </v-card>
  </v-container>

  <v-snackbar v-model="roomNotFound" color="error" :timeout="-1">
    Room not found. Redirecting...
  </v-snackbar>

  <v-dialog v-model="phoneDockDialogOpen" max-width="420" @update:model-value="onPhoneDockDialogUpdate">
    <v-card class="phone-dock-card" flat>
      <button
        aria-label="Close phone dock QR code"
        class="phone-dock-close"
        type="button"
        @click="closePhoneDockDialog"
      >
        <v-icon icon="mdi-close" size="16" />
      </button>

      <div class="kicker">Phone voting dock</div>

      <h2 class="phone-dock-title">{{ phoneDockConnected ? 'Phone connected' : 'Scan to vote privately' }}</h2>

      <p class="phone-dock-copy">
        <template v-if="phoneDockConnected">
          This phone can now vote as {{ userName || 'you' }} for the current room. You can close this QR code.
        </template>

        <template v-else>
          Scan this code from your phone while it is visible. The link expires if this dialog is closed before the phone connects.
        </template>
      </p>

      <div class="phone-dock-qr-shell" :class="{ connected: phoneDockConnected }">
        <img
          v-if="phoneDockQrImage"
          alt="QR code for phone voting dock"
          class="phone-dock-qr"
          :src="phoneDockQrImage"
        >

        <div v-else class="phone-dock-qr-loading">
          <v-icon icon="mdi-loading" size="28" />
          <span>Generating QR code</span>
        </div>

        <div v-if="phoneDockConnected" class="phone-dock-connected">
          <v-icon icon="mdi-check-circle" size="32" />
          <span>Connected</span>
        </div>
      </div>

      <v-btn class="ui-btn ui-btn-primary phone-dock-action" variant="flat" @click="closePhoneDockDialog">
        {{ phoneDockConnected ? 'Close' : 'Cancel' }}
      </v-btn>
    </v-card>
  </v-dialog>

</template>

<script lang="ts" setup>
  import type { AvatarCrop, RoomHistoryEntry, RoomHistoryVoteSnapshot, RoomRecord, RoomUser, RoundEditLock, RoundTimerState, TaskInfo, VoteValue } from '@/types/room'
  import type { ExternalDockSession } from '@/utils/externalDockSession'
  import { storeToRefs } from 'pinia'
  import QRCode from 'qrcode'
  import { computed, inject, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
  import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
  import AdvertisementSlot from '@/components/AdvertisementSlot.vue'
  import CardWallView from '@/components/CardWallView.vue'
  import ConfettiBurst from '@/components/ConfettiBurst.vue'
  import ConsoleRoomView from '@/components/ConsoleRoomView.vue'
  import FloatingReactions from '@/components/FloatingReactions.vue'
  import GroupStatusView from '@/components/GroupStatusView.vue'
  import ReactionBar from '@/components/ReactionBar.vue'
  import RoomConfigModal from '@/components/RoomConfigModal.vue'
  import RoomSidePanel from '@/components/RoomSidePanel.vue'
  import RoundStatsPanel from '@/components/RoundStatsPanel.vue'
  import SimpleResultsGrid from '@/components/SimpleResultsGrid.vue'
  import SimpleRoomView from '@/components/SimpleRoomView.vue'
  import TaskInfoModal from '@/components/TaskInfoModal.vue'
  import VoteDock from '@/components/VoteDock.vue'
  import { ref as dbRef, firebaseRoomDatabase, onDisconnect, onValue, remove, runTransaction, set, update } from '@/data/roomDatabase'
  import { demoContextKey } from '@/demo/demoContext'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore, type ViewMode } from '@/stores/config'
  import { buildSelectedAvatarCrop, buildSelectedAvatarUrl, DEFAULT_AVATAR_STYLE, isValidCustomAvatarUrl, normalizeAvatarCrop, resolveAvatarBackgroundColor } from '@/utils/avatarStyles'
  import { copyText } from '@/utils/clipboard'
  import { requestExternalDockClose, writeExternalDockContext } from '@/utils/externalDock'
  import {
    buildExternalDockUrl,
    createExternalDockSessionToken,
    EXTERNAL_DOCK_SESSION_TTL_MS,
    isExternalDockSessionExpired,
  } from '@/utils/externalDockSession'
  import { hasActiveOverlay, registerKeyboardShortcuts } from '@/utils/keyboardShortcuts'
  import { setPageTitle } from '@/utils/pageTitle'
  import { type FloatingReaction, getReactionEmojis, type RoomReactionEvent, sanitizeReactionEmojis } from '@/utils/reactions'
  import {
    buildConsoleLogAppendUpdates,
    buildConsoleLogEntry,
    buildConsoleLogId,
    buildRoundConsoleLogMap,
    normalizeConsoleLogEntries,
  } from '@/utils/roomConsoleLog'
  import { buildVoteUpdates, canParticipantVote, getVoteOptions } from '@/utils/roomVoting'
  import {
    buildTimerForRound,
    createRoundTimerStrategy,
    finishRoundTimer,
    getRoomTimerConfig,
    getTimerWarningThresholdMs,
    isTimerRunningForRound,
    normalizeTimerDurationSeconds,
    normalizeTimerWarningValue,
    pauseRoundTimer,
    pauseRoundTimerForReveal,
    restartRoundTimer,
    resumeRoundTimer,
  } from '@/utils/roundTimers'

  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()
  const configStore = useConfigStore()
  const demo = inject(demoContextKey, null)
  const roomId = demo?.roomId ?? route.params.roomId as string
  const windowDockActive = computed(() => demo ? demo.dockActive.value : appStore.externalDockActive)

  type ConsensusState = 'consensus' | 'close' | 'split'
  type TaskFlowMode = 'current' | 'next'
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
  type NormalizedRoomHistoryEntry = RoomHistoryEntry & {
    legacyVotesByName?: Record<string, string>
  }
  type LegacyRoomHistoryEntry = Omit<RoomHistoryEntry, 'votes'> & {
    votes?: unknown
    voteSnapshots?: unknown
  }
  type LegacyAvatarFields = {
    avatarStyle?: string
    avatarSeed?: string
    avatarBg?: string
    avatarSource?: 'dicebear' | 'gravatar' | 'custom'
    gravatarEmail?: string
    customAvatarUrl?: string | null
    customAvatarCrop?: AvatarCrop | null
  }
  type LegacyAvatarRecord = LegacyAvatarFields & {
    name?: string
    avatarUrl?: string | null
  }

  const VOTE_SHORTCUT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const
  const CONFETTI_PIECE_COUNT = 24
  const VIEW_MODE_SEQUENCE: ViewMode[] = ['table', 'grid', 'simple', 'console', 'group-status']
  const VIEW_MODE_LABELS: Record<ViewMode, string> = {
    'console': 'Console view',
    'grid': 'Grid view',
    'group-status': 'Group status',
    'simple': 'Simple room',
    'table': 'Card wall',
  }
  function countVotes (votes: readonly VoteValue[]): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const vote of votes) {
      const key = String(vote)
      counts[key] = (counts[key] ?? 0) + 1
    }
    return counts
  }

  const {
    avatarBg,
    avatarSeed,
    avatarSource,
    avatarStyle,
    firebaseConfig,
    gravatarEmail,
    customAvatarCrop,
    customAvatarUrl,
    userName: storedUserName,
  } = storeToRefs(configStore)

  const currentRoom = ref<RoomRecord | null>(null)
  const roomUsers = ref<Record<string, RoomUser>>({})

  const userName = computed(() => demo?.userName.value ?? storedUserName.value)
  const firebaseDb = demo ? null : configStore.getDb()
  const db = demo?.database ?? (firebaseDb ? firebaseRoomDatabase(firebaseDb) : null)
  const roomNotFound = ref(false)
  const dockCollapsed = ref(false)
  const shareCopied = ref(false)
  const roomConfigOpen = ref(false)
  const phoneDockDialogOpen = ref(false)
  const phoneDockQrImage = ref('')
  const phoneDockToken = ref<string | null>(null)
  const phoneDockConnected = ref(false)
  const phoneDockActive = ref(false)
  const playerMenu = ref<{ userId: string, name: string, x: number, y: number } | null>(null)
  const taskInfoModalOpen = ref(false)
  const pendingTaskFlow = ref<TaskFlowMode | null>(null)
  const nowTick = ref(Date.now())
  const timerWarningAnimationActive = ref(false)
  const timerExpiredAnimationActive = ref(false)

  const committedVote = computed(() => currentRoom.value?.committedVote ?? null)
  const currentTask = computed<TaskInfo | null>(() => currentRoom.value?.currentTask ?? null)
  const showConfetti = ref(false)
  const shakingUserIds = ref<string[]>([])
  const previousVotes = ref<Record<string, VoteValue | null>>({})
  const floatingReactions = ref<FloatingReaction[]>([])
  const confettiPieces = ref<Array<{
    id: string
    left: number
    top: number
    bg: string
    rotation: number
    shape: string
  }>>([])

  // Synced from config store so the panel toggle is persisted across sessions
  const historyPanelOpen = computed({
    get: () => configStore.historyPanelOpen,
    set: v => configStore.setHistoryPanelOpen(v),
  })

  let hasAutoJoined = false
  let hasSavedRoom = false
  let redirectTimeout: ReturnType<typeof setTimeout> | null = null
  let roundStartTime = Date.now()
  let unsubscribeRoom: (() => void) | null = null
  let unsubscribeUsers: (() => void) | null = null
  let unsubscribeHistory: (() => void) | null = null
  let unsubscribeReactions: (() => void) | null = null
  let unsubscribePhoneDockSession: (() => void) | null = null
  let unregisterShortcuts: (() => void) | null = null
  let leaveRoomPromise: Promise<void> | null = null
  let timerTickInterval: ReturnType<typeof setInterval> | null = null
  let timerWarningAnimationTimeout: ReturnType<typeof setTimeout> | null = null
  let timerExpiredAnimationTimeout: ReturnType<typeof setTimeout> | null = null
  let hasInitializedReactions = false
  const seenReactionIds = new Set<string>()

  const showVotes = computed(() => currentRoom.value?.settings?.showVotes === true)
  const historyEnabled = computed(() => currentRoom.value?.settings?.historyEnabled !== false)
  const allowVoteChangesAfterReveal = computed(() => currentRoom.value?.settings?.allowVoteChangesAfterReveal === true)
  const leaderModeEnabled = computed(() => currentRoom.value?.settings?.leaderModeEnabled === true)
  const taskInformationEnabled = computed(() => currentRoom.value?.settings?.taskInformationEnabled === true)
  const timerEnabled = computed(() => currentRoom.value?.settings?.timerEnabled === true)
  const timerMode = computed(() => currentRoom.value?.settings?.timerMode === 'manual' ? 'manual' : 'automatic')
  const reactionsEnabled = computed(() => currentRoom.value?.settings?.reactionsEnabled === true)
  const reactionEmojis = computed(() => getReactionEmojis(currentRoom.value?.settings?.reactionEmojis))
  const taskInfoVisible = computed(() => taskInformationEnabled.value || !!currentTask.value)
  const sidePanelEnabled = computed(() => historyEnabled.value || taskInfoVisible.value)
  const leaderUserId = computed(() => currentRoom.value?.leaderUserId ?? null)
  const createdByUserId = computed(() => currentRoom.value?.createdByUserId ?? currentRoom.value?.createdBy ?? null)
  const isLeader = computed(() => !leaderModeEnabled.value || (!!configStore.userId && leaderUserId.value === configStore.userId))
  const roundEditLock = computed<RoundEditLock | null>(() => currentRoom.value?.roundEditLock ?? null)
  const isRoundLockedByMe = computed(() => !!configStore.userId && roundEditLock.value?.userId === configStore.userId)
  const isRoundLockedByOther = computed(() => !!roundEditLock.value && !isRoundLockedByMe.value)
  const canManageRound = computed(() => (!leaderModeEnabled.value || isLeader.value) && !isRoundLockedByOther.value)
  const canCommitFinalVote = computed(() => !leaderModeEnabled.value || isLeader.value)
  const canStartTaskInfoFlow = computed(() => (!leaderModeEnabled.value || isLeader.value) && !isRoundLockedByOther.value)
  const externalVotingDockActive = computed(() => windowDockActive.value || phoneDockActive.value)
  const canEditCurrentTask = computed(() =>
    taskInformationEnabled.value
    && !!currentTask.value
    && ((!leaderModeEnabled.value || isLeader.value) && !isRoundLockedByOther.value),
  )
  const canRestoreHistoryEntry = computed(() => canManageRound.value)
  const currentRound = computed(() => currentRoom.value?.roundNumber ?? (sessionHistory.value.length + 1))
  const currentRoundLabel = computed(() => currentTask.value?.title || `Round ${currentRound.value}`)
  const roundTimer = computed(() => currentRoom.value?.roundTimer ?? null)
  const timerVisible = computed(() =>
    timerEnabled.value
    && roundTimer.value?.roundNumber === currentRound.value
    && (!taskInformationEnabled.value || !!currentTask.value),
  )
  const timerRemainingMs = computed(() => {
    const timer = roundTimer.value
    if (isTimerRunningForRound(timer, currentRound.value)) return Math.max(0, timer.endsAt - nowTick.value)
    if (timer?.roundNumber === currentRound.value && (timer.status === 'paused' || timer.status === 'idle')) {
      return Math.max(0, timer.remainingMs ?? timer.durationMs)
    }
    return 0
  })
  const timerDisplay = computed(() => {
    const durationMs = roundTimer.value?.durationMs ?? normalizeTimerDurationSeconds(currentRoom.value?.settings?.timerDurationSeconds) * 1000
    const ms = timerVisible.value ? timerRemainingMs.value : durationMs
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  })
  const timerLabel = computed(() => {
    if (!timerEnabled.value) return ''
    if (timerExpiredAnimationActive.value) return 'Timer expired'
    if (showVotes.value && roundTimer.value?.status === 'paused' && roundTimer.value.finishedBy === 'revealed') return 'Timer paused'
    if (showVotes.value || roundTimer.value?.status === 'finished') return 'Timer ended'
    if (roundTimer.value?.status === 'paused') return 'Timer paused'
    if (roundTimer.value?.status === 'running') return timerMode.value === 'manual' ? 'Manual timer running' : 'Automatic timer running'
    if (timerMode.value === 'manual') return 'Manual timer ready'
    return 'Automatic timer ready'
  })
  const timerExpired = computed(() =>
    timerExpiredAnimationActive.value
    || roundTimer.value?.status === 'finished',
  )
  const timerProgressPercent = computed(() => {
    const durationMs = Math.max(1, roundTimer.value?.durationMs ?? normalizeTimerDurationSeconds(currentRoom.value?.settings?.timerDurationSeconds) * 1000)
    return Math.max(0, Math.min(100, (timerRemainingMs.value / durationMs) * 100))
  })
  const timerWarningThresholdMs = computed(() => getTimerWarningThresholdMs(getRoomTimerConfig(currentRoom.value)))
  const timerWarningActive = computed(() =>
    timerVisible.value
    && roundTimer.value?.status === 'running'
    && timerWarningThresholdMs.value != null
    && timerRemainingMs.value > 0
    && timerRemainingMs.value <= timerWarningThresholdMs.value,
  )
  const canStartManualTimer = computed(() =>
    timerEnabled.value
    && timerMode.value === 'manual'
    && !showVotes.value
    && (roundTimer.value?.status === 'idle' || !roundTimer.value)
    && (!taskInformationEnabled.value || !!currentTask.value)
    && canManageRound.value,
  )
  const timerControlsVisible = computed(() =>
    timerEnabled.value
    && !showVotes.value
    && (!taskInformationEnabled.value || !!currentTask.value)
    && canManageRound.value,
  )
  const canPauseTimer = computed(() =>
    timerControlsVisible.value
    && roundTimer.value?.status === 'running'
    && roundTimer.value.roundNumber === currentRound.value,
  )
  const canResumeTimer = computed(() =>
    timerControlsVisible.value
    && roundTimer.value?.status === 'paused'
    && roundTimer.value.roundNumber === currentRound.value,
  )
  const canExtendTimer = computed(() =>
    timerControlsVisible.value
    && roundTimer.value?.roundNumber === currentRound.value
    && (roundTimer.value.status === 'running' || roundTimer.value.status === 'paused' || roundTimer.value.status === 'finished'),
  )
  const canRestartTimer = computed(() =>
    timerControlsVisible.value
    && roundTimer.value?.roundNumber === currentRound.value
    && (roundTimer.value.status === 'running' || roundTimer.value.status === 'paused' || roundTimer.value.status === 'finished'),
  )
  const roundActionTitle = computed(() => {
    if (leaderModeEnabled.value && !isLeader.value) return 'Only the leader can control the round'
    if (isRoundLockedByOther.value) return `${roundEditLock.value?.userName ?? 'Another participant'} is entering task information`
    if (taskInformationEnabled.value && !currentTask.value) return 'Enter task information to start this round'
    return ''
  })
  const editTaskActionTitle = computed(() => {
    if (leaderModeEnabled.value && !isLeader.value) return 'Only the leader can edit task information'
    if (isRoundLockedByOther.value) return `${roundEditLock.value?.userName ?? 'Another participant'} is editing task information`
    return 'Edit task information'
  })
  const restoreHistoryActionTitle = computed(() => {
    if (leaderModeEnabled.value && !isLeader.value) return 'Only the leader can restore a previous round'
    if (isRoundLockedByOther.value) return `${roundEditLock.value?.userName ?? 'Another participant'} is editing task information`
    return 'Restore this round for re-voting'
  })
  const voteActionHint = computed(() => {
    if (leaderModeEnabled.value && !isLeader.value) return 'Waiting for the leader to manage this round'
    if (isRoundLockedByOther.value) return `${roundEditLock.value?.userName ?? 'Another participant'} is entering task information`
    if (taskInformationEnabled.value && !currentTask.value) return 'Task information is required before anyone can vote'
    if (showVotes.value && !allowVoteChangesAfterReveal.value) return 'Voting is locked after reveal for this room'
    return ''
  })
  const canVoteInCurrentRound = computed(() => canParticipantVote(currentRoom.value, configStore.userId, roomUsers.value))
  const taskDraftInitialValue = computed<TaskInfo | null>(() =>
    pendingTaskFlow.value === 'current' ? currentTask.value : null,
  )
  const taskInfoModalTitle = computed(() => {
    if (pendingTaskFlow.value === 'next') return historyEnabled.value ? 'Start the next round' : 'Start a new round'
    return currentTask.value ? 'Update task information' : 'Start the current round'
  })
  const taskInfoModalMessage = computed(() =>
    pendingTaskFlow.value === 'next'
      ? 'Task title and URL are required before the next estimation round begins.'
      : 'Add the task this room is currently estimating so everyone sees the same context.',
  )
  const taskInfoModalSubmitLabel = computed(() =>
    pendingTaskFlow.value === 'next' ? 'Start round' : 'Save task information',
  )

  const voteOptions = computed(() => getVoteOptions(currentRoom.value?.settings))

  const orderedEstimateValues = computed(() => {
    const seen = new Set<string>()
    return voteOptions.value.filter(value => {
      if (value === '?' || value === '☕') return false
      const key = String(value)
      if (seen.has(key)) return false
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

  const activeRoundParticipants = computed<Record<string, RoomUser>>(() =>
    currentRoom.value?.roundParticipants
      ? normalizeRoomUsers(currentRoom.value.roundParticipants)
      : roomUsers.value,
  )

  const revealedVotes = computed(() =>
    Object.values(activeRoundParticipants.value)
      .map(user => user.vote)
      .filter((vote): vote is VoteValue => vote != null),
  )

  // All vote values (including ?, ☕) with their counts — used for insights deck display
  const displayVoteCounts = computed((): Record<string, number> | null => {
    if (!showVotes.value) return null
    const counts = countVotes(revealedVotes.value)
    return Object.keys(counts).length > 0 ? counts : null
  })
  const historyShortcutVoteValues = computed(() => {
    const counts = displayVoteCounts.value
    if (!counts) return []

    const presentValues = new Set(Object.keys(counts))
    const orderedDeckValues = voteOptions.value
      .map(String)
      .filter(value => presentValues.has(value))
    const extraValues = Object.keys(counts).filter(value => !orderedDeckValues.includes(value))
    return [...orderedDeckValues, ...extraValues]
  })
  const voteShortcutLookup = computed(() => {
    const availableValues = showVotes.value
      ? (canVoteInCurrentRound.value ? voteOptions.value.map(String) : historyShortcutVoteValues.value)
      : (configStore.viewMode === 'simple' || !dockCollapsed.value ? voteOptions.value.map(String) : [])

    const lookup: Record<string, string> = {}
    const standardValues = availableValues.filter(value => value !== '?' && value !== '☕')
    for (const [index, value] of standardValues.slice(0, VOTE_SHORTCUT_KEYS.length).entries()) {
      lookup[VOTE_SHORTCUT_KEYS[index]] = value
    }
    if (availableValues.includes('?')) lookup['-'] = '?'
    if (availableValues.includes('☕')) lookup['+'] = '☕'
    return lookup
  })
  const selectedVoteIndex = computed(() => {
    if (selectedVote.value == null) return -1
    return voteOptions.value.findIndex(value => String(value) === String(selectedVote.value))
  })
  const specialVoteOptions = computed(() => voteOptions.value.filter(value => value === '?' || value === '☕'))

  const votedCount = computed(() =>
    Object.values(activeRoundParticipants.value).filter(user => user.vote != null).length,
  )
  const connectedPlayerCount = computed(() => Object.keys(roomUsers.value).length)
  const totalPlayers = computed(() => Object.keys(activeRoundParticipants.value).length)
  const allVoted = computed(() => votedCount.value > 0 && votedCount.value === totalPlayers.value)
  const isCurrentUserConnected = computed(() =>
    !!configStore.userId && !!roomUsers.value[configStore.userId],
  )
  const hasCurrentUserRoundParticipant = computed(() =>
    !!configStore.userId && Object.hasOwn(activeRoundParticipants.value, configStore.userId),
  )
  const selectedVote = computed(() => {
    if (!configStore.userId || !activeRoundParticipants.value[configStore.userId]) return null
    return activeRoundParticipants.value[configStore.userId].vote ?? null
  })

  watchEffect(() => {
    const playerName = userName.value || 'Guest'
    if (roomNotFound.value) {
      setPageTitle([playerName, 'Room not found'])
      return
    }

    if (!currentRoom.value) {
      setPageTitle([playerName, 'Room'])
      return
    }

    const roomName = currentRoom.value.name
    if (showVotes.value || allVoted.value) {
      setPageTitle(['Vote done', playerName, roomName])
      return
    }

    setPageTitle([`${votedCount.value}/${totalPlayers.value}`, playerName, roomName])
  })

  const sortedRoomUsers = computed(() =>
    Object.entries(activeRoundParticipants.value)
      .map(([userId, user]) => ({
        userId,
        ...user,
        isConnected: Object.hasOwn(roomUsers.value, userId),
      }))
      .toSorted((a, b) => a.joinedAt - b.joinedAt),
  )
  const consoleLogEntries = computed(() =>
    normalizeConsoleLogEntries(currentRoom.value?.consoleLog),
  )

  const numericVotes = computed(() =>
    revealedVotes.value
      .filter((vote): vote is number => typeof vote === 'number'),
  )

  const ordinalVotes = computed(() =>
    revealedVotes.value.flatMap(vote => {
      const position = estimateOrderLookup.value.get(String(vote))
      return position == null ? [] : [{ vote, position }]
    }),
  )

  const averageVote = computed(() => {
    if (numericVotes.value.length === 0) return null
    const sum = numericVotes.value.reduce((acc, val) => acc + val, 0)
    return Number.parseFloat((sum / numericVotes.value.length).toFixed(2))
  })

  const medianVote = computed<VoteValue | null>(() => {
    if (ordinalVotes.value.length === 0) return null
    const sorted = ordinalVotes.value.toSorted((a, b) => a.position - b.position)
    const mid = Math.floor(sorted.length / 2)
    return sorted[mid]?.vote ?? null
  })

  const unanimousVote = computed(() => {
    if (revealedVotes.value.length === 0) return null
    const values = Object.keys(countVotes(revealedVotes.value))
    return values.length === 1 ? values[0] : null
  })

  const stats = computed<RoundStats | null>(() => {
    if (!showVotes.value || revealedVotes.value.length === 0) return null

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
    const consensus: ConsensusState = uniqueVoteCount === 1
      ? 'consensus'
      : (isCloseOrdinalVote ? 'close' : 'split')

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
      consensus,
    }
  })

  const defaultFinalVote = computed(() => {
    if (committedVote.value) return committedVote.value
    if (unanimousVote.value) return unanimousVote.value
    if (averageVote.value === null) return null
    return formatNum(averageVote.value)
  })

  const sessionHistory = ref<NormalizedRoomHistoryEntry[]>([])

  watch(userName, newName => {
    if (!currentRoom.value || !db || !configStore.userId) return
    const avatar = buildCurrentUserAvatarPayload(newName || 'Guest')
    const updates: Record<string, unknown> = {
      [`users/${configStore.userId}/name`]: newName || 'Anonymous',
      [`users/${configStore.userId}/avatarUrl`]: avatar.avatarUrl,
      [`users/${configStore.userId}/avatarCrop`]: avatar.avatarCrop,
    }
    if (activeRoundParticipants.value[configStore.userId]) {
      updates[`roundParticipants/${configStore.userId}/name`] = newName || 'Anonymous'
      updates[`roundParticipants/${configStore.userId}/avatarUrl`] = avatar.avatarUrl
      updates[`roundParticipants/${configStore.userId}/avatarCrop`] = avatar.avatarCrop
    }
    update(dbRef(db, `rooms/${roomId}`), updates).catch(console.error)
  })

  // When the global username modal (App.vue) sets a name after the room loaded,
  // auto-join so the user appears on the table without a page reload.
  watch(userName, newName => {
    if (newName && !hasAutoJoined && currentRoom.value) {
      hasAutoJoined = true
      joinRoom()
    }
  })

  // Sync the selected render-ready avatar to Firebase whenever local avatar settings change.
  watch(
    [
      avatarStyle,
      avatarSeed,
      avatarBg,
      avatarSource,
      gravatarEmail,
      customAvatarUrl,
      customAvatarCrop,
      () => appStore.currentTheme,
    ],
    () => {
      syncCurrentUserAvatar()
    },
  )

  watch(() => currentRoom.value?.name, newName => {
    if (newName && hasSavedRoom) configStore.updateRecentRoomName(roomId, newName)
  })

  watch(sidePanelEnabled, enabled => {
    if (!enabled) historyPanelOpen.value = false
  })

  watch(reactionsEnabled, enabled => {
    if (!enabled) floatingReactions.value = []
  })

  watch([currentRoom, roomUsers], () => {
    if (!currentRoom.value) return
    syncRoomSummary()
  }, { deep: true })

  watch([currentRoom, roomUsers], ([room, users]) => {
    if (!db || !room || room.roundParticipants || Object.keys(users).length === 0) return
    update(dbRef(db, `rooms/${roomId}`), {
      roundParticipants: buildRoundParticipants(users),
    }).catch(console.error)
  }, { deep: true })

  watch([currentRoom, activeRoundParticipants], ([room, participants]) => {
    if (!db || !room || room.consoleLog || Object.keys(participants).length === 0) return
    update(dbRef(db, `rooms/${roomId}`), {
      consoleLog: buildRoundConsoleLogMap(currentRound.value, participants, Date.now()),
    }).catch(console.error)
  }, { deep: true })

  watch(showVotes, (revealed, wasRevealed) => {
    if (revealed && !wasRevealed) {
      setTimeout(() => {
        if (stats.value?.consensus === 'consensus' && stats.value.total >= 2) {
          triggerConfetti()
        }
      }, 900)
    }
  })

  watch(activeRoundParticipants, newUsers => {
    for (const [userId, user] of Object.entries(newUsers)) {
      const prev = previousVotes.value[userId]
      const curr = user.vote ?? null
      if (prev != null && curr != null && prev !== curr) {
        triggerShakeForUser(userId)
      }
    }
    const snapshot: Record<string, VoteValue | null> = {}
    for (const [userId, user] of Object.entries(newUsers)) {
      snapshot[userId] = user.vote ?? null
    }
    previousVotes.value = snapshot
  }, { deep: true })

  watch(
    [
      timerEnabled,
      timerMode,
      showVotes,
      currentRound,
      currentTask,
      () => roundTimer.value?.status,
      () => roundTimer.value?.roundNumber,
    ],
    () => {
      if (
        timerEnabled.value
        && timerMode.value === 'automatic'
        && !showVotes.value
        && (!taskInformationEnabled.value || !!currentTask.value)
        && (
          !roundTimer.value
          || roundTimer.value.roundNumber !== currentRound.value
          || roundTimer.value.status === 'idle'
        )
      ) {
        void startAutomaticRoundTimer()
      }
    },
  )

  watch([timerRemainingMs, roundTimer, showVotes], () => {
    if (!showVotes.value && isTimerRunningForRound(roundTimer.value, currentRound.value) && timerRemainingMs.value <= 0) {
      void expireRoundTimer(roundTimer.value)
    }
  })

  watch(timerWarningActive, active => {
    if (active) triggerTimerWarningAnimation()
  })

  watch(() => roundTimer.value?.status, (status, previousStatus) => {
    if (status === 'finished' && previousStatus === 'running' && roundTimer.value?.finishedBy === 'expired') {
      triggerTimerExpiredAnimation()
    }
  })

  onMounted(() => {
    if (!db) return

    timerTickInterval = setInterval(() => {
      nowTick.value = Date.now()
    }, 250)

    window.addEventListener('click', closePlayerMenu)
    window.addEventListener('keydown', onWindowKeydown)
    window.addEventListener('refinimo:avatar-updated', syncCurrentUserAvatar)
    unregisterShortcuts = registerKeyboardShortcuts([
      {
        id: 'room.send-reaction',
        group: 'reactions',
        description: 'Send one of the configured reactions',
        keys: VOTE_SHORTCUT_KEYS.slice(0, 6).flatMap(key => [
          { key, ctrlKey: true },
          { key, metaKey: true },
        ]),
        when: () => canUseRoomShortcuts() && reactionsEnabled.value,
        handler: event => {
          const reactionIndex = Number(event.key) - 1
          const reaction = reactionEmojis.value[reactionIndex]
          if (reaction) sendReaction(reaction)
        },
      },
      {
        id: 'room.vote-card',
        group: 'voting',
        description: 'Select a vote card or final estimate',
        keys: [
          ...VOTE_SHORTCUT_KEYS.map(key => ({ key })),
        ],
        when: () => canUseRoomShortcuts() && canTriggerVoteShortcut(),
        handler: event => {
          const vote = voteShortcutLookup.value[event.key]
          if (!vote) return
          triggerShortcutVote(vote)
        },
      },
      {
        id: 'room.cycle-special-card',
        group: 'voting',
        description: 'Cycle through special cards',
        keys: [{ key: '-', code: 'Minus' }],
        when: () => canUseRoomShortcuts() && canTriggerVoteShortcut(),
        handler: () => {
          cycleSpecialVoteCards()
        },
      },
      {
        id: 'room.cycle-card-left',
        group: 'voting',
        description: 'Cycle left through card choices',
        keys: [{ code: 'BracketLeft' }],
        when: () => canUseRoomShortcuts() && canTriggerVoteShortcut(),
        handler: () => {
          cycleVoteChoice(-1)
        },
      },
      {
        id: 'room.cycle-card-right',
        group: 'voting',
        description: 'Cycle right through card choices',
        keys: [{ code: 'BracketRight' }],
        when: () => canUseRoomShortcuts() && canTriggerVoteShortcut(),
        handler: () => {
          cycleVoteChoice(1)
        },
      },
      {
        id: 'room.toggle-deck',
        group: 'voting',
        description: 'Collapse or expand the vote dock',
        keys: [{ key: ' ' }],
        when: () => canUseRoomShortcuts() && currentRoom.value !== null,
        handler: () => {
          roomCommands.toggleDeck()
        },
      },
      {
        id: 'room.toggle-external-dock',
        group: 'room',
        description: 'Open or close the external voting window',
        keys: [
          { key: ' ', ctrlKey: true },
          { key: ' ', metaKey: true },
        ],
        when: () => canUseRoomShortcuts(),
        handler: () => {
          toggleExternalDock()
        },
      },
      {
        id: 'room.toggle-votes',
        group: 'room',
        description: 'Reveal or hide votes',
        keys: [{ key: 'v' }],
        when: () => canUseRoomShortcuts(),
        handler: () => {
          if (showVotes.value) roomCommands.hideVotes()
          else roomCommands.revealVotes()
        },
      },
      {
        id: 'room.toggle-timer',
        group: 'room',
        description: 'Start or pause the timer',
        keys: [{ key: 'c' }],
        when: () => canUseRoomShortcuts() && timerControlsVisible.value,
        handler: () => {
          toggleCurrentRoundTimer()
        },
      },
      {
        id: 'room.extend-timer',
        group: 'room',
        description: 'Add 10 seconds to the timer',
        keys: [{ key: 'x' }],
        when: () => canUseRoomShortcuts() && canExtendTimer.value,
        handler: () => {
          extendCurrentRoundTimer()
        },
      },
      {
        id: 'room.restart-timer',
        group: 'room',
        description: 'Restart the timer',
        keys: [{ key: 'z' }],
        when: () => canUseRoomShortcuts() && canRestartTimer.value,
        handler: () => {
          restartCurrentRoundTimer()
        },
      },
      {
        id: 'room.open-settings',
        group: 'room',
        description: 'Open room settings',
        keys: [
          { key: 'é', ctrlKey: true },
          { key: 'É', ctrlKey: true },
          { key: 'é', metaKey: true },
          { key: 'É', metaKey: true },
        ],
        when: () => canUseRoomShortcuts() && (!leaderModeEnabled.value || isLeader.value),
        handler: () => {
          roomConfigOpen.value = true
        },
      },
      {
        id: 'room.reset-round',
        group: 'room',
        description: 'Reset the current round',
        keys: [{ key: 'b' }],
        when: () => canUseRoomShortcuts() && !showVotes.value,
        handler: () => {
          roomCommands.resetRound()
        },
      },
      {
        id: 'room.advance-round',
        group: 'room',
        description: 'Start the next round',
        keys: [{ key: 'n' }],
        when: () => canUseRoomShortcuts() && showVotes.value,
        handler: () => {
          roomCommands.advanceRound()
        },
      },
      {
        id: 'room.toggle-panel',
        group: 'navigation',
        description: 'Open or close the room side panel',
        keys: [{ key: 'p' }],
        when: () => canUseRoomShortcuts() && sidePanelEnabled.value,
        handler: () => {
          roomCommands.toggleSidePanel()
        },
      },
      {
        id: 'room.cycle-display-mode',
        group: 'navigation',
        description: 'Cycle through room display modes',
        keys: [
          { code: 'KeyL', ctrlKey: true },
          { code: 'KeyL', ctrlKey: true, shiftKey: true },
          { code: 'KeyL', metaKey: true },
          { code: 'KeyL', metaKey: true, shiftKey: true },
        ],
        when: () => canUseRoomShortcuts(),
        handler: () => {
          roomCommands.cycleDisplayMode()
        },
      },
      {
        id: 'room.go-home',
        group: 'navigation',
        description: 'Return to the lobby',
        keys: [{ key: 'Escape' }],
        when: () => canUseRoomShortcuts(),
        handler: () => {
          roomCommands.goToLobby()
        },
      },
    ])

    const roomRef = dbRef(db, `rooms/${roomId}`)
    unsubscribeRoom = onValue(roomRef, snapshot => {
      const data = snapshot.val()

      if (!data) {
        roomNotFound.value = true
        currentRoom.value = null
        if (!demo) {
          configStore.setActiveRoom(null, null)
          appStore.setRoomInfo(null, '', 0)
        }
        redirectTimeout = setTimeout(() => router.replace(demo ? '/' : '/app'), 3000)
        return
      }

      roomNotFound.value = false
      currentRoom.value = data
      syncRoomSummary(data.name)
      if (!taskInformationEnabled.value && taskInfoModalOpen.value) {
        taskInfoModalOpen.value = false
        pendingTaskFlow.value = null
      }

      if (!demo && !hasSavedRoom) {
        hasSavedRoom = true
        configStore.saveRecentRoom(roomId, data.name)
      }

      if (!hasAutoJoined && userName.value) {
        hasAutoJoined = true
        joinRoom()
      }
    })

    const usersRef = dbRef(db, `rooms/${roomId}/users`)
    unsubscribeUsers = onValue(usersRef, snapshot => {
      roomUsers.value = normalizeRoomUsers(snapshot.val())
    })

    const historyRef = dbRef(db, `rooms/${roomId}/history`)
    unsubscribeHistory = onValue(historyRef, snapshot => {
      const data = snapshot.val()
      if (!data) {
        sessionHistory.value = []
        return
      }
      sessionHistory.value = Object.entries(data as Record<string, LegacyRoomHistoryEntry>)
        .map(([historyId, entry]) => normalizeHistoryEntry(historyId, entry))
        .toSorted((a, b) => a.round - b.round)
    })

    const reactionsRef = dbRef(db, `rooms/${roomId}/reactions`)
    unsubscribeReactions = onValue(reactionsRef, snapshot => {
      const data = snapshot.val() as Record<string, RoomReactionEvent> | null
      if (!data) {
        hasInitializedReactions = true
        return
      }

      if (!hasInitializedReactions) {
        for (const reactionId of Object.keys(data)) {
          seenReactionIds.add(reactionId)
        }
        hasInitializedReactions = true
        return
      }

      if (!reactionsEnabled.value) {
        for (const reactionId of Object.keys(data)) {
          seenReactionIds.add(reactionId)
        }
        return
      }

      for (const [reactionId, event] of Object.entries(data)) {
        if (seenReactionIds.has(reactionId)) continue
        seenReactionIds.add(reactionId)
        if (!isValidReactionEvent(event)) continue
        if (!reactionEmojis.value.includes(event.emoji)) continue
        if (configStore.viewMode === 'console') continue
        addFloatingReaction(reactionId, event)
      }
    })
  })

  onUnmounted(() => {
    window.removeEventListener('click', closePlayerMenu)
    window.removeEventListener('keydown', onWindowKeydown)
    window.removeEventListener('refinimo:avatar-updated', syncCurrentUserAvatar)
    unregisterShortcuts?.()
    unsubscribeRoom?.()
    unsubscribeUsers?.()
    unsubscribeHistory?.()
    unsubscribeReactions?.()
    unsubscribePhoneDockSession?.()
    void cleanupPhoneDockSession()
    if (timerTickInterval !== null) clearInterval(timerTickInterval)
    if (timerWarningAnimationTimeout !== null) clearTimeout(timerWarningAnimationTimeout)
    if (timerExpiredAnimationTimeout !== null) clearTimeout(timerExpiredAnimationTimeout)
    if (redirectTimeout !== null) clearTimeout(redirectTimeout)
    void releaseRoundEditLock()
  })

  onBeforeRouteLeave(async () => {
    await leaveRoomPresence()
  })

  function formatNum (num: number | null | undefined): string {
    if (num == null) return '-'
    return Number.isInteger(num) ? String(num) : String(Number.parseFloat(num.toFixed(2)))
  }

  function formatOptionalNum (num: number | null | undefined): string | null {
    if (num === null || num === undefined) return null
    return formatNum(num)
  }

  function formatOptionalVote (vote: VoteValue | null | undefined): string | null {
    if (vote === null || vote === undefined) return null
    return String(vote)
  }

  function parseStoredVote (vote: string | VoteValue): VoteValue {
    if (typeof vote !== 'string') return vote
    const trimmed = vote.trim()
    if (!trimmed) return vote
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? vote : parsed
  }

  function buildCurrentUserAvatarPayload (fallbackSeed = userName.value || 'Guest') {
    return {
      avatarUrl: buildSelectedAvatarUrl({
        avatarSource: configStore.avatarSource,
        customAvatarUrl: configStore.customAvatarUrl,
        gravatarEmail: configStore.gravatarEmail,
        avatarStyle: configStore.avatarStyle,
        avatarSeed: configStore.avatarSeed,
        avatarBg: resolveAvatarBackgroundColor(configStore.avatarBg, appStore.currentTheme),
        fallbackSeed,
      }),
      avatarCrop: buildSelectedAvatarCrop(configStore.avatarSource, configStore.customAvatarCrop),
    }
  }

  function syncCurrentUserAvatar () {
    if (!db || !configStore.userId || !currentRoom.value) return
    const avatar = buildCurrentUserAvatarPayload()
    const updates: Record<string, unknown> = {
      [`users/${configStore.userId}/avatarUrl`]: avatar.avatarUrl,
      [`users/${configStore.userId}/avatarCrop`]: avatar.avatarCrop,
    }
    if (activeRoundParticipants.value[configStore.userId]) {
      updates[`roundParticipants/${configStore.userId}/avatarUrl`] = avatar.avatarUrl
      updates[`roundParticipants/${configStore.userId}/avatarCrop`] = avatar.avatarCrop
    }
    update(dbRef(db, `rooms/${roomId}`), updates).catch(console.error)
  }

  function buildHistoryVotes (): Record<string, RoomHistoryVoteSnapshot> {
    const snapshots: Record<string, RoomHistoryVoteSnapshot> = {}
    for (const [userId, user] of Object.entries(activeRoundParticipants.value)) {
      if (user.vote == null) continue
      snapshots[userId] = {
        name: user.name,
        vote: user.vote,
        avatarUrl: user.avatarUrl ?? null,
        avatarCrop: user.avatarCrop ?? null,
      }
    }
    return snapshots
  }

  function isVoteSnapshotRecord (value: unknown): value is Record<string, RoomHistoryVoteSnapshot> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false

    return Object.values(value).every(snapshot => (
      !!snapshot
      && typeof snapshot === 'object'
      && !Array.isArray(snapshot)
      && typeof (snapshot as Partial<RoomHistoryVoteSnapshot>).name === 'string'
      && (
        typeof (snapshot as Partial<RoomHistoryVoteSnapshot>).vote === 'string'
        || typeof (snapshot as Partial<RoomHistoryVoteSnapshot>).vote === 'number'
      )
    ))
  }

  function isLegacyVoteRecord (value: unknown): value is Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    return Object.values(value).every(vote => typeof vote === 'string')
  }

  function normalizeHistoryEntry (_historyId: string, entry: LegacyRoomHistoryEntry): NormalizedRoomHistoryEntry {
    const { votes: storedVotes, voteSnapshots, ...historyEntry } = entry
    const votes = isVoteSnapshotRecord(storedVotes)
      ? storedVotes
      : (isVoteSnapshotRecord(voteSnapshots) ? voteSnapshots : undefined)
    const legacyVotesByName = isLegacyVoteRecord(storedVotes) ? storedVotes : undefined

    return {
      ...historyEntry,
      ...(votes ? { votes } : {}),
      ...(legacyVotesByName ? { legacyVotesByName } : {}),
    }
  }

  function buildHistoryEntryBase () {
    const id = String(Date.now())
    const durationMs = Date.now() - roundStartTime
    const completedAt = Date.now()

    return {
      id,
      durationMs,
      completedAt,
      voteSnapshots: buildHistoryVotes(),
    }
  }

  function closePlayerMenu () {
    playerMenu.value = null
  }

  function onWindowKeydown (event: KeyboardEvent) {
    if (event.key === 'Escape') closePlayerMenu()
  }

  function canUseRoomShortcuts (): boolean {
    return currentRoom.value !== null
      && !hasActiveOverlay()
      && !roomConfigOpen.value
      && !taskInfoModalOpen.value
      && playerMenu.value === null
  }

  function canTriggerVoteShortcut (): boolean {
    if (showVotes.value && canVoteInCurrentRound.value) return !dockCollapsed.value
    if (showVotes.value) return historyEnabled.value && canCommitFinalVote.value
    return !dockCollapsed.value && canVoteInCurrentRound.value
  }

  function triggerShortcutVote (vote: VoteValue) {
    if (showVotes.value && canVoteInCurrentRound.value) {
      castVote(parseShortcutVoteValue(String(vote)))
      return
    }

    if (showVotes.value) {
      onCommitVote(String(vote))
      return
    }

    castVote(parseShortcutVoteValue(String(vote)))
  }

  function getCycleVoteOptions (): VoteValue[] {
    if (showVotes.value && !canVoteInCurrentRound.value) {
      return historyShortcutVoteValues.value
    }

    if (!showVotes.value && configStore.viewMode !== 'simple' && dockCollapsed.value) {
      return []
    }

    return voteOptions.value
  }

  function cycleVoteChoice (direction: -1 | 1) {
    const options = getCycleVoteOptions()
    if (options.length === 0) return

    const currentIndex = showVotes.value && !canVoteInCurrentRound.value
      ? options.findIndex(value => String(value) === String(committedVote.value))
      : selectedVoteIndex.value
    const nextIndex = currentIndex === -1
      ? (direction > 0 ? 0 : options.length - 1)
      : (currentIndex + direction + options.length) % options.length
    triggerShortcutVote(options[nextIndex])
  }

  function cycleSpecialVoteCards () {
    const options = showVotes.value && !canVoteInCurrentRound.value
      ? historyShortcutVoteValues.value.filter(value => value === '?' || value === '☕')
      : specialVoteOptions.value
    if (options.length === 0) return

    const currentValue = showVotes.value && !canVoteInCurrentRound.value ? committedVote.value : selectedVote.value
    const currentIndex = options.findIndex(value => String(value) === String(currentValue))
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length
    triggerShortcutVote(options[nextIndex])
  }

  function toggleCurrentRoundTimer () {
    if (canPauseTimer.value) {
      void pauseCurrentRoundTimer()
      return
    }

    if (canResumeTimer.value) {
      void resumeCurrentRoundTimer()
      return
    }

    if (canStartManualTimer.value) {
      void startManualRoundTimer()
    }
  }

  function buildRoundParticipants (users: Record<string, RoomUser>): Record<string, RoomUser> {
    const participants: Record<string, RoomUser> = {}
    for (const [userId, user] of Object.entries(users)) {
      participants[userId] = {
        name: user.name,
        joinedAt: user.joinedAt,
        avatarUrl: user.avatarUrl ?? null,
        avatarCrop: user.avatarCrop ?? null,
      }
    }
    return participants
  }

  function normalizeRoomUsers (value: unknown): Record<string, RoomUser> {
    if (!value || typeof value !== 'object') return {}
    return Object.fromEntries(
      Object.entries(value as Record<string, RoomUser & LegacyAvatarFields>)
        .map(([userId, user]) => [userId, normalizeRoomUser(user)]),
    )
  }

  function normalizeRoomUser (user: RoomUser & LegacyAvatarFields): RoomUser {
    const avatarUrl = user.avatarUrl ?? buildLegacyAvatarUrl(user)
    const avatarCrop = user.avatarCrop ?? (
      user.avatarSource === 'custom'
        ? normalizeAvatarCrop(user.customAvatarCrop)
        : null
    )

    const normalizedUser: RoomUser = {
      name: user.name,
      joinedAt: user.joinedAt,
      avatarUrl,
      avatarCrop,
    }

    if (user.vote == null) return normalizedUser
    return {
      ...normalizedUser,
      vote: user.vote,
    }
  }

  function buildLegacyAvatarUrl (user: LegacyAvatarRecord): string | null {
    if (user.avatarSource === 'custom' && isValidCustomAvatarUrl(user.customAvatarUrl)) {
      return user.customAvatarUrl.trim()
    }

    if (user.avatarSource === 'gravatar' && user.gravatarEmail) {
      return buildSelectedAvatarUrl({
        avatarSource: 'gravatar',
        customAvatarUrl: null,
        gravatarEmail: user.gravatarEmail,
        avatarStyle: user.avatarStyle ?? DEFAULT_AVATAR_STYLE,
        avatarSeed: user.avatarSeed ?? '',
        avatarBg: resolveAvatarBackgroundColor(configStore.avatarBg, appStore.currentTheme),
        fallbackSeed: user.name || 'Guest',
      })
    }

    if (user.avatarStyle || user.avatarSeed) {
      return buildSelectedAvatarUrl({
        avatarSource: 'dicebear',
        customAvatarUrl: null,
        gravatarEmail: user.gravatarEmail,
        avatarStyle: user.avatarStyle ?? DEFAULT_AVATAR_STYLE,
        avatarSeed: user.avatarSeed ?? '',
        avatarBg: resolveAvatarBackgroundColor(configStore.avatarBg, appStore.currentTheme),
        fallbackSeed: user.name || 'Guest',
      })
    }

    return user.avatarUrl ?? null
  }

  function buildRoundParticipantsWithVotes (
    users: Record<string, RoomUser>,
    votes?: Record<string, RoomHistoryVoteSnapshot>,
  ): Record<string, RoomUser> {
    const participants = buildRoundParticipants(users)
    if (!votes) return participants

    for (const [userId, snapshot] of Object.entries(votes)) {
      const legacySnapshot = snapshot as RoomHistoryVoteSnapshot & LegacyAvatarFields
      participants[userId] = {
        ...(participants[userId] ?? { name: snapshot.name, joinedAt: 0 }),
        name: snapshot.name,
        vote: snapshot.vote,
        avatarUrl: snapshot.avatarUrl ?? buildLegacyAvatarUrl(legacySnapshot) ?? participants[userId]?.avatarUrl,
        avatarCrop: snapshot.avatarCrop ?? (
          legacySnapshot.avatarSource === 'custom'
            ? normalizeAvatarCrop(legacySnapshot.customAvatarCrop)
            : participants[userId]?.avatarCrop
        ),
      }
    }

    return participants
  }

  function parseShortcutVoteValue (value: string): VoteValue {
    const numericValue = Number(value)
    return Number.isNaN(numericValue) ? value : numericValue
  }

  function syncRoomSummary (roomNameOverride?: string, connectedOverride?: boolean, hasParticipantOverride?: boolean, countOverride?: number) {
    if (demo) return
    const roomNameValue = roomNameOverride ?? currentRoom.value?.name ?? ''
    const isConnected = connectedOverride ?? isCurrentUserConnected.value
    const hasRoundParticipant = hasParticipantOverride ?? hasCurrentUserRoundParticipant.value
    const count = countOverride ?? connectedPlayerCount.value

    if (isConnected || hasRoundParticipant) {
      configStore.setActiveRoom(roomId, roomNameValue)
      appStore.setRoomInfo(roomId, roomNameValue, count, isConnected, hasRoundParticipant)
      return
    }

    configStore.setActiveRoom(null, null)
    appStore.setRoomInfo(null, '', 0)
  }

  async function leaveRoomPresence () {
    if (leaveRoomPromise) return leaveRoomPromise

    const userId = configStore.userId
    const roomNameValue = currentRoom.value?.name ?? configStore.activeRoomName ?? ''
    const hasRoundParticipant = !!userId && Object.hasOwn(activeRoundParticipants.value, userId)
    const wasConnected = !!userId && !!roomUsers.value[userId]
    const nextCount = Math.max(0, connectedPlayerCount.value - (wasConnected ? 1 : 0))

    leaveRoomPromise = (async () => {
      if (db && userId && wasConnected) {
        await remove(dbRef(db, `rooms/${roomId}/users/${userId}`)).catch(console.error)
      }
      syncRoomSummary(roomNameValue, false, hasRoundParticipant, nextCount)
    })()

    try {
      await leaveRoomPromise
    } finally {
      leaveRoomPromise = null
    }
  }

  function joinRoom () {
    if (!db || !configStore.userId) return
    const existingParticipant = activeRoundParticipants.value[configStore.userId]
    const avatar = buildCurrentUserAvatarPayload()
    const userRecord = {
      name: userName.value || 'Anonymous',
      // Preserve the demo's assigned seat when presence feeds the next round.
      joinedAt: demo && existingParticipant ? existingParticipant.joinedAt : Date.now(),
      ...avatar,
    }
    const roundParticipant = existingParticipant
      ? {
        name: userRecord.name,
        joinedAt: existingParticipant.joinedAt,
        avatarUrl: userRecord.avatarUrl,
        avatarCrop: userRecord.avatarCrop,
        ...(existingParticipant.vote == null ? {} : { vote: existingParticipant.vote }),
      }
      : userRecord

    const updates: Record<string, unknown> = {
      [`users/${configStore.userId}`]: userRecord,
      [`roundParticipants/${configStore.userId}`]: roundParticipant,
    }
    if (!existingParticipant) {
      const createdAt = Date.now()
      const entry = buildConsoleLogEntry(
        'info',
        `${userRecord.name} is in the lobby.`,
        createdAt,
        currentRound.value,
        {
          userId: configStore.userId,
          userName: userRecord.name,
        },
      )
      Object.assign(updates, buildConsoleLogAppendUpdates([entry], currentRoom.value?.consoleLog))
    }
    update(dbRef(db, `rooms/${roomId}`), updates).catch(console.error)
    const userRef = dbRef(db, `rooms/${roomId}/users/${configStore.userId}`)
    onDisconnect(userRef).remove()
  }

  async function shareRoomConfig () {
    if (demo) {
      const ok = await copyText(`${window.location.origin}${import.meta.env.BASE_URL}demo`)
      appStore.showToast(ok ? 'Demo link copied. Each visitor gets their own practice room.' : 'Copy failed.', ok ? 'success' : 'error')
      return
    }
    if (!firebaseConfig.value) return

    const encoded = btoa(JSON.stringify(firebaseConfig.value))
    const url = `${window.location.origin}${import.meta.env.BASE_URL}app/room/${encodeURIComponent(roomId)}?config=${encodeURIComponent(encoded)}`
    const ok = await copyText(url)

    if (ok) {
      shareCopied.value = true
      appStore.showToast('Room link with config copied.', 'success')
      setTimeout(() => {
        shareCopied.value = false
      }, 2000)
    } else {
      appStore.showToast('Copy failed. Your browser blocked clipboard access.', 'error')
    }
  }

  function toggleExternalDock () {
    if (demo) {
      demo.toggleDock()
      return
    }
    if (windowDockActive.value) {
      requestExternalDockClose()
      appStore.setExternalDockActive(false)
      return
    }

    writeExternalDockContext(roomId, currentRoom.value?.name ?? configStore.activeRoomName)
    const url = firebaseConfig.value
      ? buildExternalDockUrl(roomId, firebaseConfig.value, null, appStore.currentTheme)
      : `${window.location.origin}${import.meta.env.BASE_URL}app/dock/${encodeURIComponent(roomId)}?theme=${encodeURIComponent(appStore.currentTheme)}`
    const dockWindow = window.open(url, 'Refinimo-voting-dock', 'popup,width=520,height=720')
    if (dockWindow) {
      dockWindow.focus()
    }
  }

  function bringVotingDockBack () {
    if (phoneDockActive.value || phoneDockToken.value) {
      void cleanupPhoneDockSession()
      return
    }

    toggleExternalDock()
  }

  async function openPhoneDockQr () {
    if (demo) {
      appStore.showToast('Phone voting needs a connected room. Try the separate voting window in this demo.', 'error')
      return
    }
    if (phoneDockActive.value || phoneDockConnected.value) {
      await cleanupPhoneDockSession()
      appStore.showToast('Phone voting dock disconnected.', 'success')
      return
    }

    if (!db || !firebaseConfig.value || !configStore.userId) {
      appStore.showToast('Room configuration is required before creating a phone dock.', 'error')
      return
    }

    await cleanupPhoneDockSession()

    const now = Date.now()
    const token = createExternalDockSessionToken()
    const avatar = buildCurrentUserAvatarPayload()
    const session: ExternalDockSession = {
      token,
      userId: configStore.userId,
      userName: userName.value || 'Anonymous',
      avatarUrl: avatar.avatarUrl,
      avatarCrop: avatar.avatarCrop,
      createdAt: now,
      expiresAt: now + EXTERNAL_DOCK_SESSION_TTL_MS,
      claimedAt: null,
      lastSeenAt: null,
      status: 'waiting',
    }

    try {
      await set(dbRef(db, `rooms/${roomId}/externalDockSessions/${token}`), session)

      phoneDockToken.value = token
      phoneDockConnected.value = false
      phoneDockDialogOpen.value = true
      await refreshPhoneDockQr()

      watchPhoneDockSession(token)
    } catch (error) {
      console.error(error)
      appStore.showToast('Could not create the phone voting dock.', 'error')
      await cleanupPhoneDockSession()
    }
  }

  async function refreshPhoneDockQr () {
    if (!firebaseConfig.value || !phoneDockToken.value) return

    try {
      phoneDockQrImage.value = await QRCode.toDataURL(
        buildExternalDockUrl(roomId, firebaseConfig.value, phoneDockToken.value, appStore.currentTheme),
        {
          errorCorrectionLevel: 'L',
          margin: 1,
          width: 320,
        },
      )
    } catch {
      appStore.showToast('Enter a valid URL for the phone QR code.', 'error')
    }
  }

  function watchPhoneDockSession (token: string) {
    if (!db) return

    unsubscribePhoneDockSession?.()
    unsubscribePhoneDockSession = onValue(dbRef(db, `rooms/${roomId}/externalDockSessions/${token}`), snapshot => {
      const session = snapshot.val() as ExternalDockSession | null
      if (!session) {
        phoneDockConnected.value = false
        phoneDockActive.value = false
        phoneDockToken.value = null
        phoneDockQrImage.value = ''
        unsubscribePhoneDockSession?.()
        unsubscribePhoneDockSession = null
        return
      }

      if (session.claimedAt && !isExternalDockSessionExpired(session)) {
        const wasConnected = phoneDockConnected.value
        phoneDockConnected.value = true
        phoneDockActive.value = true
        if (!wasConnected) {
          closePhoneDockDialog()
          appStore.showToast('You are connected to your phone.', 'success')
        }
      }
    })
  }

  function onPhoneDockDialogUpdate (open: boolean) {
    if (!open) {
      closePhoneDockDialog()
    }
  }

  function closePhoneDockDialog () {
    phoneDockDialogOpen.value = false
    if (phoneDockConnected.value) {
      phoneDockQrImage.value = ''
      phoneDockActive.value = true
      return
    }

    void cleanupPhoneDockSession()
  }

  async function cleanupPhoneDockSession (options: { keepConnected?: boolean } = {}) {
    const token = phoneDockToken.value

    if (!options.keepConnected) {
      unsubscribePhoneDockSession?.()
      unsubscribePhoneDockSession = null
    }
    phoneDockQrImage.value = ''

    if (db && token && (!options.keepConnected || !phoneDockConnected.value)) {
      try {
        await remove(dbRef(db, `rooms/${roomId}/externalDockSessions/${token}`))
      } catch (error) {
        console.error(error)
      }
    }

    if (!options.keepConnected) {
      phoneDockToken.value = null
      phoneDockConnected.value = false
      phoneDockActive.value = false
    }
  }

  function triggerShakeForUser (userId: string) {
    shakingUserIds.value = shakingUserIds.value.filter(id => id !== userId)
    requestAnimationFrame(() => {
      shakingUserIds.value = [...shakingUserIds.value, userId]
      setTimeout(() => {
        shakingUserIds.value = shakingUserIds.value.filter(id => id !== userId)
      }, 500)
    })
  }

  async function startAutomaticRoundTimer () {
    if (!db || !currentRoom.value) return

    const roomRef = dbRef(db, `rooms/${roomId}`)
    await runTransaction(roomRef, current => {
      if (!current) return current
      const config = getRoomTimerConfig(current)
      if (!config.enabled || config.mode !== 'automatic') return current
      if (current.settings?.showVotes === true) return current
      if (current.settings?.taskInformationEnabled === true && !current.currentTask) return current

      const roundNumber = typeof current.roundNumber === 'number' ? current.roundNumber : currentRound.value
      if (isTimerRunningForRound(current.roundTimer, roundNumber)) return current
      if (current.roundTimer?.status === 'paused' && current.roundTimer.roundNumber === roundNumber) return current

      return {
        ...current,
        roundTimer: createRoundTimerStrategy(config).beginRound(roundNumber, Date.now()),
        lastActivity: Date.now(),
      }
    }).catch(console.error)
  }

  async function startManualRoundTimer () {
    if (!db || !currentRoom.value || !canStartManualTimer.value) return

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    await runTransaction(roomRef, current => {
      if (!current) return current
      const config = getRoomTimerConfig(current)
      if (!config.enabled || config.mode !== 'manual') return current
      if (current.settings?.showVotes === true) return current
      if (current.settings?.taskInformationEnabled === true && !current.currentTask) return current

      const roundNumber = typeof current.roundNumber === 'number' ? current.roundNumber : currentRound.value
      const strategy = createRoundTimerStrategy(config)
      return {
        ...current,
        roundTimer: strategy.startManual?.(roundNumber, Date.now()) ?? current.roundTimer ?? null,
        lastActivity: Date.now(),
      }
    }).catch(console.error)
  }

  async function pauseCurrentRoundTimer () {
    if (!db || !canPauseTimer.value) return

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    await runTransaction(roomRef, current => {
      if (!current) return current
      const roundNumber = typeof current.roundNumber === 'number' ? current.roundNumber : currentRound.value
      const timer = current.roundTimer as RoundTimerState | null | undefined
      if (!isTimerRunningForRound(timer, roundNumber)) return current

      return {
        ...current,
        roundTimer: pauseRoundTimer(timer, Date.now()),
        lastActivity: Date.now(),
      }
    }).catch(console.error)
  }

  async function resumeCurrentRoundTimer () {
    if (!db || !canResumeTimer.value) return

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    await runTransaction(roomRef, current => {
      if (!current) return current
      const roundNumber = typeof current.roundNumber === 'number' ? current.roundNumber : currentRound.value
      const timer = current.roundTimer as RoundTimerState | null | undefined
      if (!timer || timer.status !== 'paused' || timer.roundNumber !== roundNumber) return current

      return {
        ...current,
        roundTimer: resumeRoundTimer(timer, Date.now()),
        lastActivity: Date.now(),
      }
    }).catch(console.error)
  }

  async function restartCurrentRoundTimer () {
    if (!db || !canRestartTimer.value) return

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    await runTransaction(roomRef, current => {
      if (!current) return current
      const roundNumber = typeof current.roundNumber === 'number' ? current.roundNumber : currentRound.value
      const timer = current.roundTimer as RoundTimerState | null | undefined
      if (!timer || timer.roundNumber !== roundNumber || (timer.status !== 'running' && timer.status !== 'paused' && timer.status !== 'finished')) return current

      return {
        ...current,
        roundTimer: restartRoundTimer(timer, Date.now()),
        lastActivity: Date.now(),
      }
    }).catch(console.error)
  }

  async function extendCurrentRoundTimer () {
    if (!db || !canExtendTimer.value) return

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    await runTransaction(roomRef, current => {
      if (!current) return current
      const roundNumber = typeof current.roundNumber === 'number' ? current.roundNumber : currentRound.value
      const timer = current.roundTimer as RoundTimerState | null | undefined
      if (!timer || timer.roundNumber !== roundNumber) return current

      const now = Date.now()
      const addedMs = 10_000
      const remainingMs = isTimerRunningForRound(timer, roundNumber)
        ? Math.max(0, timer.endsAt - now)
        : Math.max(0, timer.remainingMs ?? 0)

      return {
        ...current,
        roundTimer: {
          ...timer,
          status: 'running',
          startedAt: now,
          endsAt: now + remainingMs + addedMs,
          remainingMs: remainingMs + addedMs,
          finishedBy: null,
        },
        lastActivity: now,
      }
    }).catch(console.error)
  }

  async function expireRoundTimer (timer: RoundTimerState) {
    if (!db) return

    const roomRef = dbRef(db, `rooms/${roomId}`)
    await runTransaction(roomRef, current => {
      if (!current) return current
      const roundNumber = typeof current.roundNumber === 'number' ? current.roundNumber : currentRound.value
      const currentTimer = current.roundTimer as RoundTimerState | null | undefined
      const config = getRoomTimerConfig(current)
      if (!isTimerRunningForRound(currentTimer, roundNumber)) return current
      const now = Date.now()
      if (currentTimer.endsAt !== timer.endsAt || currentTimer.endsAt > now) return current
      if (current.settings?.showVotes === true) return current
      const revealLogId = buildConsoleLogId(now, 'timer-reveal')

      return {
        ...current,
        consoleLog: config.autoRevealEnabled
          ? {
            ...current.consoleLog,
            [revealLogId]: buildConsoleLogEntry(
              'system',
              'Timer expired. Votes revealed in the side panel.',
              now,
              roundNumber,
              { id: revealLogId },
            ),
          }
          : current.consoleLog,
        settings: current.settings
          ? { ...current.settings, showVotes: config.autoRevealEnabled }
          : { showVotes: config.autoRevealEnabled },
        roundTimer: finishRoundTimer(currentTimer, roundNumber, 'expired'),
        lastActivity: now,
      }
    }).catch(console.error)
  }

  function buildCurrentRoomTimerForRound (roundNumber: number, now: number): RoundTimerState | null {
    return buildTimerForRound(currentRoom.value, roundNumber, now)
  }

  function castVote (value: VoteValue) {
    if (!db || !configStore.userId || !canVoteInCurrentRound.value) return

    closePlayerMenu()

    const previousVote = selectedVote.value
    const isVoteChange = previousVote !== null && value !== previousVote

    const currentPlayerName = activeRoundParticipants.value[configStore.userId]?.name ?? userName.value ?? 'Anonymous'
    update(dbRef(db, `rooms/${roomId}`), buildVoteUpdates(
      { ...currentRoom.value!, roundParticipants: activeRoundParticipants.value }, configStore.userId, currentPlayerName, value,
    )).catch(console.error)

    if (isVoteChange && configStore.userId) {
      triggerShakeForUser(configStore.userId)
    }
  }

  function isValidReactionEvent (event: unknown): event is RoomReactionEvent {
    return !!event
      && typeof event === 'object'
      && typeof (event as Partial<RoomReactionEvent>).emoji === 'string'
      && typeof (event as Partial<RoomReactionEvent>).userId === 'string'
      && typeof (event as Partial<RoomReactionEvent>).createdAt === 'number'
  }

  function sendReaction (emoji: string) {
    if (!db || !configStore.userId || !reactionsEnabled.value) return
    if (!reactionEmojis.value.includes(emoji)) return

    const createdAt = Date.now()
    const reactionId = `${createdAt}-${configStore.userId}-${Math.random().toString(36).slice(2, 8)}`
    const currentPlayerName = activeRoundParticipants.value[configStore.userId]?.name ?? userName.value ?? 'Anonymous'
    const event: RoomReactionEvent = {
      emoji,
      userId: configStore.userId,
      createdAt,
    }

    seenReactionIds.add(reactionId)
    if (configStore.viewMode !== 'console') {
      addFloatingReaction(reactionId, event)
    }

    const reactionRef = dbRef(db, `rooms/${roomId}/reactions/${reactionId}`)
    const entry = buildConsoleLogEntry(
      'trace',
      `${currentPlayerName} reacted ${emoji}.`,
      createdAt,
      currentRound.value,
      {
        userId: configStore.userId,
        userName: currentPlayerName,
      },
    )
    update(dbRef(db, `rooms/${roomId}`), {
      lastActivity: createdAt,
      ...buildConsoleLogAppendUpdates([entry], currentRoom.value?.consoleLog),
    }).catch(console.error)
    set(reactionRef, event)
      .then(() => {
        setTimeout(() => {
          remove(reactionRef).catch(console.error)
        }, 5000)
      })
      .catch(console.error)
  }

  function addFloatingReaction (reactionId: string, event: RoomReactionEvent) {
    const anchor = document.querySelector<HTMLElement>(`[data-reaction-user-id="${CSS.escape(event.userId)}"]`)
    const rect = anchor?.getBoundingClientRect()
    const fallbackRect = document.querySelector<HTMLElement>('.main')?.getBoundingClientRect()
    const baseX = rect ? rect.left + rect.width / 2 : (fallbackRect ? fallbackRect.left + fallbackRect.width / 2 : window.innerWidth / 2)
    const baseY = rect ? rect.top + rect.height / 2 : (fallbackRect ? fallbackRect.top + fallbackRect.height / 2 : window.innerHeight / 2)
    const reaction: FloatingReaction = {
      id: `${reactionId}-${Math.random().toString(36).slice(2, 6)}`,
      emoji: event.emoji,
      x: baseX + randomBetween(-14, 14),
      y: baseY + randomBetween(-10, 10),
      drift: randomBetween(-26, 26),
      durationMs: Math.round(randomBetween(1300, 1900)),
    }

    floatingReactions.value = [...floatingReactions.value, reaction].slice(-80)
    setTimeout(() => {
      floatingReactions.value = floatingReactions.value.filter(item => item.id !== reaction.id)
    }, reaction.durationMs + 120)
  }

  function randomBetween (min: number, max: number) {
    return min + Math.random() * (max - min)
  }

  function applyRoomConfig (settings: {
    name: string
    deck: 'fibonacci' | 'modified-fibonacci' | 'linear' | 'power-of-2' | 'tshirt' | 'custom'
    customDeck: string
    specialQuestion: boolean
    specialCoffee: boolean
    historyEnabled: boolean
    allowVoteChangesAfterReveal: boolean
    leaderModeEnabled: boolean
    taskInformationEnabled: boolean
    timerEnabled: boolean
    timerMode: 'automatic' | 'manual'
    timerDurationSeconds: number
    timerAutoRevealEnabled: boolean
    timerWarningEnabled: boolean
    timerWarningType: 'seconds' | 'percentage'
    timerWarningValue: number
    reactionsEnabled: boolean
    reactionEmojis: string[]
  }) {
    if (!db || !currentRoom.value) return

    closePlayerMenu()
    const taskInfoWasEnabled = taskInformationEnabled.value

    const newOptions = getVoteOptions(settings)
    const normalizedTimerDurationSeconds = normalizeTimerDurationSeconds(settings.timerDurationSeconds)
    const timerWarningType = settings.timerWarningType === 'percentage' ? 'percentage' : 'seconds'
    const normalizedTimerWarningValue = normalizeTimerWarningValue(settings.timerWarningValue, timerWarningType)
    const nextReactionEmojis = sanitizeReactionEmojis(settings.reactionEmojis)

    const updates: Record<string, unknown> = {
      'name': settings.name,
      'settings/deck': settings.deck,
      'settings/customDeck': settings.deck === 'custom' ? settings.customDeck : null,
      'settings/specialQuestion': settings.specialQuestion,
      'settings/specialCoffee': settings.specialCoffee,
      'settings/historyEnabled': settings.historyEnabled,
      'settings/allowVoteChangesAfterReveal': settings.allowVoteChangesAfterReveal,
      'settings/leaderModeEnabled': settings.leaderModeEnabled,
      'settings/taskInformationEnabled': settings.taskInformationEnabled,
      'settings/timerEnabled': settings.timerEnabled,
      'settings/timerMode': settings.timerMode,
      'settings/timerDurationSeconds': normalizedTimerDurationSeconds,
      'settings/timerAutoRevealEnabled': settings.timerAutoRevealEnabled,
      'settings/timerWarningEnabled': settings.timerWarningEnabled,
      'settings/timerWarningType': timerWarningType,
      'settings/timerWarningValue': normalizedTimerWarningValue,
      'settings/reactionsEnabled': settings.reactionsEnabled,
      'settings/reactionEmojis': nextReactionEmojis,
      'leaderUserId': settings.leaderModeEnabled
        ? (leaderUserId.value ?? createdByUserId.value ?? null)
        : null,
      'createdByUserId': createdByUserId.value,
      'lastActivity': Date.now(),
    }

    if (!settings.reactionsEnabled) {
      updates.reactions = null
    }

    // Only reset votes that are no longer in the new deck
    const invalidUserIds = Object.entries(activeRoundParticipants.value)
      .filter(([, user]) => user.vote != null && !newOptions.includes(user.vote))
      .map(([userId]) => userId)

    if (invalidUserIds.length > 0) {
      for (const userId of invalidUserIds) {
        updates[`roundParticipants/${userId}/vote`] = null
      }
      if (showVotes.value) {
        updates['settings/showVotes'] = false
      }
    }

    if (!settings.taskInformationEnabled) {
      updates.currentTask = null
      updates.roundEditLock = null
    }

    const timerConfigChanged = settings.timerEnabled !== timerEnabled.value
      || settings.timerMode !== timerMode.value
      || normalizedTimerDurationSeconds !== normalizeTimerDurationSeconds(currentRoom.value.settings?.timerDurationSeconds)
      || settings.timerAutoRevealEnabled !== (currentRoom.value.settings?.timerAutoRevealEnabled !== false)
      || settings.timerWarningEnabled !== (currentRoom.value.settings?.timerWarningEnabled === true)
      || timerWarningType !== (currentRoom.value.settings?.timerWarningType === 'percentage' ? 'percentage' : 'seconds')
      || normalizedTimerWarningValue !== normalizeTimerWarningValue(currentRoom.value.settings?.timerWarningValue, timerWarningType)

    if (timerConfigChanged) {
      const canStartTimer = !showVotes.value && (!settings.taskInformationEnabled || !!currentTask.value)
      updates.roundTimer = settings.timerEnabled && canStartTimer
        ? buildTimerForRound({
          settings: {
            ...currentRoom.value.settings,
            timerEnabled: settings.timerEnabled,
            timerMode: settings.timerMode,
            timerDurationSeconds: normalizedTimerDurationSeconds,
            timerAutoRevealEnabled: settings.timerAutoRevealEnabled,
            timerWarningEnabled: settings.timerWarningEnabled,
            timerWarningType,
            timerWarningValue: normalizedTimerWarningValue,
          },
        }, currentRound.value, Date.now())
        : null
    }

    update(dbRef(db, `rooms/${roomId}`), updates)
      .then(() => {
        if (!taskInfoWasEnabled && settings.taskInformationEnabled && !currentTask.value) {
          return startTaskInfoFlow('current')
        }
        if (taskInfoWasEnabled && !settings.taskInformationEnabled) {
          taskInfoModalOpen.value = false
          pendingTaskFlow.value = null
        }
        return undefined
      })
      .catch(console.error)
  }

  function onCommitVote (value: string) {
    if (!db || !canCommitFinalVote.value) return
    closePlayerMenu()
    update(dbRef(db, `rooms/${roomId}`), { committedVote: value, lastActivity: Date.now() }).catch(console.error)
  }

  function revealVotes () {
    if (!db || votedCount.value === 0 || !canManageRound.value || (taskInformationEnabled.value && !currentTask.value)) return
    closePlayerMenu()
    const roomRef = dbRef(db, `rooms/${roomId}`)
    const now = Date.now()
    update(roomRef, {
      'settings/showVotes': true,
      'roundTimer': pauseRoundTimerForReveal(roundTimer.value, currentRound.value, now),
      'lastActivity': now,
      ...buildConsoleLogAppendUpdates([
        buildConsoleLogEntry('system', 'Votes revealed in the side panel.', now, currentRound.value),
      ], currentRoom.value?.consoleLog),
    }).catch(console.error)
  }

  async function hideVotes () {
    if (!db || !canManageRound.value) return
    closePlayerMenu()

    const room = currentRoom.value
    const now = Date.now()
    const roundNumber = typeof room?.roundNumber === 'number' ? room.roundNumber : currentRound.value
    const timer = room?.roundTimer ?? null
    const config = getRoomTimerConfig(room)
    let nextTimer = timer

    if (timer && timer.roundNumber === roundNumber) {
      if (timer.status === 'paused' && timer.finishedBy === 'revealed' && config.mode === 'automatic') {
        nextTimer = resumeRoundTimer(timer, now)
      } else if (timer.status === 'finished' && timer.finishedBy === 'expired' && config.mode === 'automatic') {
        nextTimer = restartRoundTimer(timer, now)
      }
    }

    await update(dbRef(db, `rooms/${roomId}`), {
      'committedVote': null,
      'lastActivity': now,
      'roundTimer': nextTimer,
      'settings/showVotes': false,
      ...buildConsoleLogAppendUpdates([
        buildConsoleLogEntry('info', 'Votes hidden. The round is open again.', now, roundNumber),
      ], currentRoom.value?.consoleLog),
    }).catch(console.error)
  }

  async function resetCurrentRound () {
    if (!db || !canManageRound.value) return

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    const lastActivity = Date.now()

    await runTransaction(roomRef, current => {
      if (!current) return current

      const currentUsers = normalizeRoomUsers(current.users)
      const roundNumber = typeof current.roundNumber === 'number' ? current.roundNumber : currentRound.value
      return {
        ...current,
        committedVote: null,
        consoleLog: buildRoundConsoleLogMap(roundNumber, currentUsers, lastActivity, 'reset'),
        roundParticipants: buildRoundParticipants(currentUsers),
        roundTimer: buildTimerForRound(current, roundNumber, lastActivity),
        lastActivity,
        settings: current.settings
          ? { ...current.settings, showVotes: false }
          : { showVotes: false },
      }
    }).catch(console.error)
  }

  async function advanceRound () {
    if (!db || !canManageRound.value) return

    if (taskInformationEnabled.value) {
      void startTaskInfoFlow('next')
      return
    }

    closePlayerMenu()

    const roomRef = dbRef(db, `rooms/${roomId}`)
    const lastActivity = Date.now()

    if (showVotes.value && currentRoom.value && historyEnabled.value) {
      const { id, durationMs, completedAt, voteSnapshots } = buildHistoryEntryBase()

      const historyEntry = {
        id,
        finalVote: defaultFinalVote.value ?? '-',
        avg: formatOptionalNum(stats.value?.avg),
        closest: formatOptionalVote(stats.value?.closest),
        round: currentRound.value,
        durationMs,
        completedAt,
        participantCount: totalPlayers.value,
        consensus: stats.value?.consensus === 'consensus' ? 'yes' : 'split',
        voteSnapshots,
      }

      roundStartTime = Date.now()
      await update(roomRef, buildAdvanceRoundUpdates(lastActivity, {
        [`history/${id}`]: historyEntry,
      })).catch(console.error)
      return
    }

    await update(roomRef, buildAdvanceRoundUpdates(lastActivity)).catch(console.error)
  }

  function buildAdvanceRoundUpdates (
    lastActivity: number,
    extraUpdates: Record<string, unknown> = {},
  ): Record<string, unknown> {
    const nextRoundNumber = currentRound.value + 1
    return {
      'committedVote': null,
      'consoleLog': buildRoundConsoleLogMap(nextRoundNumber, roomUsers.value, lastActivity),
      'lastActivity': lastActivity,
      'roundNumber': nextRoundNumber,
      'roundParticipants': buildRoundParticipants(roomUsers.value),
      'roundTimer': buildCurrentRoomTimerForRound(nextRoundNumber, lastActivity),
      'settings/showVotes': false,
      ...extraUpdates,
    }
  }

  async function startTaskInfoFlow (mode: TaskFlowMode) {
    if (!db || !configStore.userId || !canStartTaskInfoFlow.value) return

    closePlayerMenu()

    const acquired = await acquireRoundEditLock()
    if (!acquired) return

    pendingTaskFlow.value = mode
    taskInfoModalOpen.value = true
  }

  async function acquireRoundEditLock (): Promise<boolean> {
    if (!db || !configStore.userId) return false

    const lockRef = dbRef(db, `rooms/${roomId}/roundEditLock`)
    const userId = configStore.userId
    const userNameValue = userName.value || 'Anonymous'

    try {
      const result = await runTransaction(lockRef, current => {
        if (current && current.userId !== userId) return
        return {
          userId,
          userName: userNameValue,
          acquiredAt: Date.now(),
        }
      })

      if (!result.committed) {
        return false
      }

      const lockValue = result.snapshot.val() as RoundEditLock | null
      if (lockValue?.userId !== userId) {
        return false
      }

      onDisconnect(lockRef).remove()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async function releaseRoundEditLock () {
    if (!db || !configStore.userId || !isRoundLockedByMe.value) return

    try {
      await update(dbRef(db, `rooms/${roomId}`), {
        roundEditLock: null,
        lastActivity: Date.now(),
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function saveTaskInformation (task: TaskInfo) {
    if (!db || !currentRoom.value || !pendingTaskFlow.value || !isRoundLockedByMe.value) return

    const roomRef = dbRef(db, `rooms/${roomId}`)
    const lastActivity = Date.now()
    const updates: Record<string, unknown> = {
      currentTask: task,
      roundEditLock: null,
      lastActivity,
    }

    if (!showVotes.value) {
      updates.roundTimer = buildCurrentRoomTimerForRound(currentRound.value, lastActivity)
    }

    if (pendingTaskFlow.value === 'next') {
      if (showVotes.value && historyEnabled.value) {
        const { id, durationMs, completedAt, voteSnapshots } = buildHistoryEntryBase()

        const historyEntry = {
          id,
          title: currentTask.value?.title ?? null,
          url: currentTask.value?.url ?? null,
          description: currentTask.value?.description ?? null,
          finalVote: defaultFinalVote.value ?? '-',
          avg: formatOptionalNum(stats.value?.avg),
          closest: formatOptionalVote(stats.value?.closest),
          round: currentRound.value,
          durationMs,
          completedAt,
          participantCount: totalPlayers.value,
          consensus: stats.value?.consensus === 'consensus' ? 'yes' : 'split',
          voteSnapshots,
        }

        roundStartTime = Date.now()
        update(roomRef, buildAdvanceRoundUpdates(lastActivity, {
          currentTask: task,
          roundEditLock: null,
          [`history/${id}`]: historyEntry,
        }))
          .then(() => {
            taskInfoModalOpen.value = false
            pendingTaskFlow.value = null
          })
          .catch(console.error)
        return
      }

      update(roomRef, buildAdvanceRoundUpdates(lastActivity, {
        currentTask: task,
        roundEditLock: null,
      }))
        .then(() => {
          taskInfoModalOpen.value = false
          pendingTaskFlow.value = null
        })
        .catch(console.error)
      return
    }

    update(roomRef, updates)
      .then(() => {
        taskInfoModalOpen.value = false
        pendingTaskFlow.value = null
      })
      .catch(console.error)
  }

  watch(taskInfoModalOpen, open => {
    if (open) return
    if (pendingTaskFlow.value !== null) {
      void releaseRoundEditLock()
      pendingTaskFlow.value = null
    }
  })

  function restoreHistoryEntry (historyId: string) {
    if (!db || !canRestoreHistoryEntry.value) return

    const entry = sessionHistory.value.find(item => item.id === historyId)
    if (!entry) return

    closePlayerMenu()

    const lastActivity = Date.now()
    const restoredParticipants = buildRoundParticipantsWithVotes(
      roomUsers.value,
      entry.votes && Object.keys(entry.votes).length > 0 ? entry.votes : undefined,
    )
    const updates: Record<string, unknown> = {
      'settings/showVotes': false,
      'committedVote': null,
      'consoleLog': buildRoundConsoleLogMap(currentRound.value, restoredParticipants, lastActivity, 'reset'),
      'lastActivity': lastActivity,
      'roundParticipants': restoredParticipants,
      'roundTimer': buildCurrentRoomTimerForRound(currentRound.value, lastActivity),
      'currentTask': entry.title
        ? {
          title: entry.title,
          url: entry.url ?? null,
          description: entry.description ?? null,
        }
        : null,
    }

    if (!entry.votes && entry.legacyVotesByName) {
      const participants = buildRoundParticipants(roomUsers.value)
      for (const [userId, user] of Object.entries(participants)) {
        const legacyVote = entry.legacyVotesByName[user.name]
        if (legacyVote === undefined) continue
        participants[userId].vote = parseStoredVote(legacyVote)
      }
      updates.roundParticipants = participants
      updates.consoleLog = buildRoundConsoleLogMap(currentRound.value, participants, lastActivity, 'reset')
    }

    roundStartTime = lastActivity
    update(dbRef(db, `rooms/${roomId}`), updates).catch(console.error)
  }

  function openPlayerMenu (payload: { userId: string, name: string, x: number, y: number }) {
    if (!leaderModeEnabled.value || !isLeader.value || payload.userId === leaderUserId.value) {
      closePlayerMenu()
      return
    }

    playerMenu.value = payload
  }

  function transferLeadership (userId: string) {
    if (!db || !leaderModeEnabled.value || !isLeader.value || userId === leaderUserId.value) return
    closePlayerMenu()

    update(dbRef(db, `rooms/${roomId}`), {
      leaderUserId: userId,
      lastActivity: Date.now(),
    }).catch(console.error)
  }

  function triggerConfetti () {
    const colors = ['#4f8cff', '#3ecf8e', '#f5b14d', '#f05a5a', '#a78bfa', '#ffffff']
    confettiPieces.value = Array.from({ length: CONFETTI_PIECE_COUNT }, (_, index) => ({
      id: `c${index}`,
      left: Math.random() * 100,
      top: 8 + Math.random() * 78,
      bg: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? '50%' : '2px',
    }))
    showConfetti.value = true
    setTimeout(() => {
      showConfetti.value = false
    }, 1800)
  }

  function triggerTimerWarningAnimation () {
    timerWarningAnimationActive.value = false
    if (timerWarningAnimationTimeout !== null) clearTimeout(timerWarningAnimationTimeout)
    requestAnimationFrame(() => {
      timerWarningAnimationActive.value = true
      timerWarningAnimationTimeout = setTimeout(() => {
        timerWarningAnimationActive.value = false
      }, 1400)
    })
  }

  function triggerTimerExpiredAnimation () {
    timerExpiredAnimationActive.value = false
    if (timerExpiredAnimationTimeout !== null) clearTimeout(timerExpiredAnimationTimeout)
    requestAnimationFrame(() => {
      timerExpiredAnimationActive.value = true
      timerExpiredAnimationTimeout = setTimeout(() => {
        timerExpiredAnimationActive.value = false
      }, 1800)
    })
  }

  const roomCommands = {
    toggleDeck () {
      if (configStore.viewMode === 'simple') return
      dockCollapsed.value = !dockCollapsed.value
    },
    toggleSidePanel () {
      if (!sidePanelEnabled.value) return
      historyPanelOpen.value = !historyPanelOpen.value
    },
    cycleDisplayMode () {
      const currentIndex = VIEW_MODE_SEQUENCE.indexOf(configStore.viewMode)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % VIEW_MODE_SEQUENCE.length
      const nextMode = VIEW_MODE_SEQUENCE[nextIndex]
      configStore.setViewMode(nextMode)
      appStore.showToast(`Room view: ${VIEW_MODE_LABELS[nextMode]}`, 'success')
    },
    copyRoomLink () {
      void shareRoomConfig()
    },
    revealVotes,
    hideVotes,
    resetRound: resetCurrentRound,
    advanceRound,
    goToLobby () {
      void leaveRoomPresence().finally(() => {
        router.push(demo ? '/' : '/app')
      })
    },
  }
</script>
