import type { RoomRecord, RoomUser } from '@/types/room'
import { buildAvatarUrl } from '@/utils/avatarStyles'
import { DEFAULT_REACTION_EMOJIS } from '@/utils/reactions'
import { buildRoundConsoleLogMap } from '@/utils/roomConsoleLog'

interface DemoPlayer {
  readonly name: string
  readonly color: string
  readonly avatarStyle: string
}

// A character keeps the same color and seeded avatar across every demo session.
export const DEMO_PLAYERS: readonly DemoPlayer[] = [
  { name: 'Ada', color: '#f3e8ff', avatarStyle: 'lorelei' },
  { name: 'Adrian', color: '#e0f2fe', avatarStyle: 'notionists-neutral' },
  { name: 'Aisha', color: '#ffedd5', avatarStyle: 'adventurer-neutral' },
  { name: 'Akira', color: '#ecfdf5', avatarStyle: 'pixel-art' },
  { name: 'Alex', color: '#dbeafe', avatarStyle: 'notionists' },
  { name: 'Alice', color: '#ffe4e6', avatarStyle: 'miniavs' },
  { name: 'Amara', color: '#fef9c3', avatarStyle: 'micah' },
  { name: 'André', color: '#d8ede2', avatarStyle: 'thumbs' },
  { name: 'Anika', color: '#e9ddfa', avatarStyle: 'fun-emoji' },
  { name: 'Arthur', color: '#fde2d3', avatarStyle: 'bottts' },
  { name: 'Avery', color: '#ecfdf5', avatarStyle: 'adventurer-neutral' },
  { name: 'Bea', color: '#fef9c3', avatarStyle: 'lorelei' },
  { name: 'Ben', color: '#e9ddfa', avatarStyle: 'miniavs' },
  { name: 'Bruno', color: '#dbeafe', avatarStyle: 'pixel-art' },
  { name: 'Camille', color: '#fde2d3', avatarStyle: 'notionists-neutral' },
  { name: 'Celeste', color: '#e0f2fe', avatarStyle: 'micah' },
  { name: 'Charlie', color: '#ffe4e6', avatarStyle: 'bottts' },
  { name: 'Chloé', color: '#f3e8ff', avatarStyle: 'thumbs' },
  { name: 'Clara', color: '#ffedd5', avatarStyle: 'fun-emoji' },
  { name: 'David', color: '#d8ede2', avatarStyle: 'notionists' },
  { name: 'Diego', color: '#fef9c3', avatarStyle: 'pixel-art' },
  { name: 'Dominic', color: '#e0f2fe', avatarStyle: 'thumbs' },
  { name: 'Elena', color: '#ecfdf5', avatarStyle: 'notionists' },
  { name: 'Eli', color: '#fde2d3', avatarStyle: 'micah' },
  { name: 'Éloïse', color: '#f3e8ff', avatarStyle: 'adventurer-neutral' },
  { name: 'Emery', color: '#d8ede2', avatarStyle: 'fun-emoji' },
  { name: 'Emile', color: '#e9ddfa', avatarStyle: 'bottts' },
  { name: 'Emma', color: '#ffe4e6', avatarStyle: 'lorelei' },
  { name: 'Ethan', color: '#ffedd5', avatarStyle: 'miniavs' },
  { name: 'Fatima', color: '#dbeafe', avatarStyle: 'notionists-neutral' },
  { name: 'Felix', color: '#e9ddfa', avatarStyle: 'notionists' },
  { name: 'Finn', color: '#ecfdf5', avatarStyle: 'bottts' },
  { name: 'Freya', color: '#fde2d3', avatarStyle: 'lorelei' },
  { name: 'Gabriel', color: '#f3e8ff', avatarStyle: 'miniavs' },
  { name: 'Grace', color: '#dbeafe', avatarStyle: 'fun-emoji' },
  { name: 'Harper', color: '#ffedd5', avatarStyle: 'micah' },
  { name: 'Henry', color: '#ffe4e6', avatarStyle: 'adventurer-neutral' },
  { name: 'Hugo', color: '#fef9c3', avatarStyle: 'notionists-neutral' },
  { name: 'Imani', color: '#e0f2fe', avatarStyle: 'thumbs' },
  { name: 'Inès', color: '#d8ede2', avatarStyle: 'pixel-art' },
  { name: 'Iris', color: '#ffe4e6', avatarStyle: 'micah' },
  { name: 'Isabel', color: '#e9ddfa', avatarStyle: 'lorelei' },
  { name: 'Jacob', color: '#ffedd5', avatarStyle: 'notionists' },
  { name: 'Jade', color: '#ecfdf5', avatarStyle: 'adventurer-neutral' },
  { name: 'Jamie', color: '#f3e8ff', avatarStyle: 'fun-emoji' },
  { name: 'Jules', color: '#dbeafe', avatarStyle: 'miniavs' },
  { name: 'Juliette', color: '#fef9c3', avatarStyle: 'thumbs' },
  { name: 'Kai', color: '#fde2d3', avatarStyle: 'pixel-art' },
  { name: 'Kenji', color: '#d8ede2', avatarStyle: 'bottts' },
  { name: 'Layla', color: '#e0f2fe', avatarStyle: 'notionists-neutral' },
  { name: 'Léa', color: '#fef9c3', avatarStyle: 'miniavs' },
  { name: 'Leila', color: '#dbeafe', avatarStyle: 'adventurer-neutral' },
  { name: 'Leo', color: '#d8ede2', avatarStyle: 'notionists' },
  { name: 'Liam', color: '#e0f2fe', avatarStyle: 'fun-emoji' },
  { name: 'Lin', color: '#ffe4e6', avatarStyle: 'bottts' },
  { name: 'Lou', color: '#ecfdf5', avatarStyle: 'thumbs' },
  { name: 'Luca', color: '#e9ddfa', avatarStyle: 'micah' },
  { name: 'Lucie', color: '#ffedd5', avatarStyle: 'pixel-art' },
  { name: 'Malik', color: '#f3e8ff', avatarStyle: 'notionists-neutral' },
  { name: 'Mateo', color: '#fde2d3', avatarStyle: 'lorelei' },
  { name: 'Maya', color: '#ecfdf5', avatarStyle: 'lorelei' },
  { name: 'Mei', color: '#fef9c3', avatarStyle: 'pixel-art' },
  { name: 'Mila', color: '#fde2d3', avatarStyle: 'micah' },
  { name: 'Milo', color: '#e9ddfa', avatarStyle: 'thumbs' },
  { name: 'Morgan', color: '#e0f2fe', avatarStyle: 'notionists-neutral' },
  { name: 'Nadia', color: '#d8ede2', avatarStyle: 'adventurer-neutral' },
  { name: 'Noah', color: '#ffedd5', avatarStyle: 'fun-emoji' },
  { name: 'Noémie', color: '#dbeafe', avatarStyle: 'miniavs' },
  { name: 'Nora', color: '#f3e8ff', avatarStyle: 'notionists' },
  { name: 'Oliver', color: '#ffe4e6', avatarStyle: 'bottts' },
  { name: 'Omar', color: '#d8ede2', avatarStyle: 'miniavs' },
  { name: 'Owen', color: '#f3e8ff', avatarStyle: 'notionists' },
  { name: 'Parker', color: '#ffe4e6', avatarStyle: 'pixel-art' },
  { name: 'Priya', color: '#ffedd5', avatarStyle: 'lorelei' },
  { name: 'Quinn', color: '#e9ddfa', avatarStyle: 'adventurer-neutral' },
  { name: 'Rafael', color: '#fef9c3', avatarStyle: 'bottts' },
  { name: 'Rémy', color: '#ecfdf5', avatarStyle: 'notionists-neutral' },
  { name: 'Riley', color: '#fde2d3', avatarStyle: 'fun-emoji' },
  { name: 'Robin', color: '#e0f2fe', avatarStyle: 'micah' },
  { name: 'Rose', color: '#dbeafe', avatarStyle: 'thumbs' },
  { name: 'Rowan', color: '#e0f2fe', avatarStyle: 'bottts' },
  { name: 'Sam', color: '#f3e8ff', avatarStyle: 'micah' },
  { name: 'Sana', color: '#d8ede2', avatarStyle: 'lorelei' },
  { name: 'Sasha', color: '#fef9c3', avatarStyle: 'adventurer-neutral' },
  { name: 'Selma', color: '#fde2d3', avatarStyle: 'miniavs' },
  { name: 'Simon', color: '#dbeafe', avatarStyle: 'pixel-art' },
  { name: 'Sofia', color: '#ecfdf5', avatarStyle: 'notionists' },
  { name: 'Stella', color: '#ffe4e6', avatarStyle: 'thumbs' },
  { name: 'Talia', color: '#ffedd5', avatarStyle: 'notionists-neutral' },
  { name: 'Taylor', color: '#e9ddfa', avatarStyle: 'fun-emoji' },
  { name: 'Theo', color: '#fde2d3', avatarStyle: 'thumbs' },
  { name: 'Uma', color: '#ffe4e6', avatarStyle: 'notionists-neutral' },
  { name: 'Valentina', color: '#dbeafe', avatarStyle: 'lorelei' },
  { name: 'Vera', color: '#d8ede2', avatarStyle: 'fun-emoji' },
  { name: 'Victor', color: '#e9ddfa', avatarStyle: 'pixel-art' },
  { name: 'William', color: '#ecfdf5', avatarStyle: 'miniavs' },
  { name: 'Yara', color: '#ffedd5', avatarStyle: 'micah' },
  { name: 'Yuki', color: '#f3e8ff', avatarStyle: 'bottts' },
  { name: 'Zain', color: '#e0f2fe', avatarStyle: 'adventurer-neutral' },
  { name: 'Zoe', color: '#fef9c3', avatarStyle: 'notionists' },
]

// Counts are simulated teammates, in addition to the visitor. Weights total 100.
const TEAM_SIZES = [
  { count: 1, weight: 5 },
  { count: 2, weight: 7 },
  { count: 3, weight: 3 },
  { count: 4, weight: 30 },
  { count: 5, weight: 30 },
  { count: 6, weight: 15 },
  { count: 7, weight: 7 },
  { count: 8, weight: 3 },
] as const

function pickTeammateCount (random: () => number): number {
  let ticket = random() * TEAM_SIZES.reduce((sum, size) => sum + size.weight, 0)
  for (const { count, weight } of TEAM_SIZES) {
    if (ticket < weight) {
      return count
    }
    ticket -= weight
  }
  return TEAM_SIZES.at(-1)!.count
}

export function createDemoRoom (visitorId: string, visitorName: string, random = Math.random, now = Date.now()) {
  const count = pickTeammateCount(random)
  const pool = DEMO_PLAYERS.filter(player => player.name.toLowerCase() !== visitorName.trim().toLowerCase())
  const users: Record<string, RoomUser> = {
    [visitorId]: { name: visitorName, joinedAt: now },
  }
  const botIds: string[] = []
  let firstAvatarStyle: string | undefined
  for (let index = 0; index < count; index++) {
    // Teams with more than one character always show at least two avatar styles.
    const candidates = index === 1 ? pool.filter(player => player.avatarStyle !== firstAvatarStyle) : pool
    const player = candidates[Math.floor(random() * candidates.length)]
    pool.splice(pool.indexOf(player), 1)
    if (index === 0) {
      firstAvatarStyle = player.avatarStyle
    }
    const id = `demo-player-${index + 1}`
    botIds.push(id)
    users[id] = {
      name: player.name,
      joinedAt: now + index + 1,
      avatarUrl: buildAvatarUrl(player.avatarStyle, player.name, player.color),
    }
  }

  // Every seat, including the first and last, has the same chance for the visitor.
  const playerOrder = [...botIds]
  playerOrder.splice(Math.floor(random() * (count + 1)), 0, visitorId)
  const orderedUsers = Object.fromEntries(playerOrder.map((id, index) => [id, {
    ...users[id],
    joinedAt: now + index,
  }]))

  const room: RoomRecord & { users: Record<string, RoomUser> } = {
    name: 'Practice room',
    createdAt: now,
    createdBy: visitorId,
    createdByUserId: visitorId,
    users: orderedUsers,
    roundParticipants: orderedUsers,
    roundNumber: 1,
    lastActivity: now,
    consoleLog: buildRoundConsoleLogMap(1, orderedUsers, now),
    settings: {
      deck: 'fibonacci',
      showVotes: false,
      specialQuestion: true,
      specialCoffee: true,
      historyEnabled: true,
      reactionsEnabled: true,
      reactionEmojis: [...DEFAULT_REACTION_EMOJIS],
    },
  }
  return { room, botIds }
}
