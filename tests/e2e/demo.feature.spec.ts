import { expect, test } from '@playwright/test'
import { encodeFirebaseConfig, validFirebaseConfig } from './support/appFlows'
import { tablePlayer, voteCard } from './support/roomFlows'

test.describe('Feature: full application demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('refinimo_view_mode', 'table'))
  })

  test('a visitor votes with a generated team and plays multiple rounds using real history', async ({ page }) => {
    const backendRequests: string[] = []
    const errors: string[] = []
    page.on('request', request => {
      if (/__firebase-mock|firebaseio\.com|firebasedatabase\.app/.test(request.url())) {
        backendRequests.push(request.url())
      }
    })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/demo')
    await expect(page.getByTestId('room-shell')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    const players = page.getByTestId('room-player')
    const count = await players.count()
    expect(count).toBeGreaterThanOrEqual(2)
    expect(count).toBeLessThanOrEqual(9)
    const names = await players.evaluateAll(items => items.map(item => item.dataset.playerName))
    expect(new Set(names).size).toBe(count)
    await expect(tablePlayer(page, 'Demo')).toBeVisible()
    await voteCard(page, '5').click()
    await voteCard(page, '8').click()
    await expect(voteCard(page, '8')).toHaveClass(/selected/)
    await voteCard(page, '8').click()
    await expect(voteCard(page, '8')).not.toHaveClass(/selected/)
    await voteCard(page, '3').click()
    await expect(page.getByTestId('room-vote-count')).toHaveText(`${count}/${count} voted`, { timeout: 12_000 })
    await page.getByTestId('room-reveal-votes').click()
    await expect(voteCard(page, '3')).toBeDisabled()
    await page.getByTestId('room-next-round').click()
    await expect(page.getByTestId('room-round-label')).toHaveText('Round 2')
    await expect(page.getByTestId('room-vote-count')).toHaveText(`0/${count} voted`)
    await voteCard(page, '5').click()
    await expect(page.getByTestId('room-vote-count')).toHaveText(`${count}/${count} voted`, { timeout: 12_000 })
    await page.getByTestId('room-toggle-panel').click()
    await expect(page.getByTestId('room-history-entry')).toHaveCount(1)
    expect(backendRequests).toEqual([])
    expect(errors).toEqual([])
  })

  for (const [random, count, visitorSeat] of [[0, 1, 0], [0.4, 4, 2], [0.999, 8, 8]] as const) {
    test(`a team of ${count} simulated players keeps the visitor in seat ${visitorSeat + 1} across rounds`, async ({ page }) => {
      await page.addInitScript(sample => {
        Math.random = () => sample
      }, random)
      await page.goto('/demo')
      const players = page.getByTestId('room-player')
      await expect(players).toHaveCount(count + 1)
      await expect(players.nth(visitorSeat)).toHaveAttribute('data-player-name', 'Demo')
      await expect(players.nth(visitorSeat)).toHaveClass(/is-you/)
      const banner = page.getByRole('complementary', { name: 'About this demo' })
      await expect(banner).toContainText(`${count} simulated ${count === 1 ? 'teammate' : 'teammates'} will vote with you`)
      if (count > 1) {
        const avatars = await players.filter({ hasNot: page.getByText('Demo', { exact: true }) }).locator('img').evaluateAll(images => images.map(image => new URL(image.src).pathname))
        expect(new Set(avatars).size).toBeGreaterThan(1)
      }
      await voteCard(page, '5').click()
      await expect(page.getByTestId('room-vote-count')).toHaveText(`${count + 1}/${count + 1} voted`, { timeout: 12_000 })
      await page.getByTestId('room-reveal-votes').click()
      await page.getByTestId('room-next-round').click()
      await expect(page.getByTestId('room-round-label')).toHaveText('Round 2')
      await expect(players.nth(visitorSeat)).toHaveAttribute('data-player-name', 'Demo')
      await page.getByTestId('room-reset-round').click()
      await expect(players.nth(visitorSeat)).toHaveAttribute('data-player-name', 'Demo')
    })
  }

  test('room settings change the real deck and the simulated votes', async ({ page }) => {
    await page.goto('/demo')
    await page.getByTestId('room-open-settings').click()
    await page.getByTestId('room-name-input').locator('input').fill('My demo sprint')
    await page.getByTestId('room-deck-custom').click()
    await page.getByTestId('room-custom-deck-input').locator('input').fill('Small, Medium, Large')
    await page.getByTestId('room-toggle-question').uncheck()
    await page.getByTestId('room-toggle-break').uncheck()
    await page.getByTestId('room-settings-save').click()
    await expect(page.getByTestId('room-name')).toHaveText('My demo sprint')
    await expect(page.getByTestId('vote-card')).toHaveCount(3)
    await voteCard(page, 'Medium').click()
    const count = await page.getByTestId('room-player').count()
    await expect(page.getByTestId('room-vote-count')).toHaveText(`${count}/${count} voted`, { timeout: 12_000 })
    await page.getByTestId('room-reveal-votes').click()
    for (const card of await page.getByTestId('room-player-card').all()) {
      await expect(card).toContainText(/Small|Medium|Large/)
    }
    await page.getByTestId('room-open-settings').click()
    await page.getByTestId('room-toggle-post-reveal-voting').check()
    await page.getByTestId('room-settings-save').click()
    await voteCard(page, 'Large').click()
    await expect(voteCard(page, 'Large')).toHaveClass(/selected/)
  })

  test('task entry and manual timers use the application controls', async ({ page }) => {
    await page.goto('/demo')
    await page.getByTestId('room-open-settings').click()
    await page.getByTestId('room-toggle-task-info').check()
    await page.getByTestId('room-toggle-timer').check()
    await page.getByTestId('room-timer-mode-manual').click()
    await page.getByTestId('room-timer-duration-input').locator('input').fill('30')
    await page.getByTestId('room-settings-save').click()
    await page.getByLabel('Task title').fill('Improve the search')
    await page.getByRole('button', { name: 'Save task information', exact: true }).click()
    await expect(page.getByTestId('room-round-label')).toHaveText('Improve the search')
    await page.getByTestId('room-start-timer').click()
    await page.getByTestId('room-pause-timer').click()
    await expect(page.getByTestId('room-resume-timer')).toBeVisible()
    await page.getByTestId('room-resume-timer').click()
    await voteCard(page, '5').click()
    await page.getByTestId('room-reveal-votes').click()
    await page.getByTestId('room-next-round').click()
    await page.getByLabel('Task title').fill('Invite teammates')
    await page.getByRole('button', { name: 'Start round', exact: true }).click()
    await expect(page.getByTestId('room-round-label')).toHaveText('Invite teammates')
  })

  test('the real popup dock shares votes locally and closes when a new demo starts', async ({ page }) => {
    await page.goto('/demo')
    const roster = await page.getByTestId('room-player').allTextContents()
    const popupPromise = page.waitForEvent('popup')
    await page.getByTestId('vote-dock-external').click()
    const popup = await popupPromise
    await expect(voteCard(popup, '8')).toBeVisible()
    await expect(popup).toHaveTitle(/Demo.*Voting Dock/)
    await voteCard(popup, '8').click()
    await expect(tablePlayer(page, 'Demo').locator('.avatar')).toHaveClass(/has-voted/)
    await page.getByTestId('room-reveal-votes').click()
    await expect(tablePlayer(page, 'Demo').getByTestId('room-player-card')).toContainText('8')
    await expect(voteCard(popup, '8')).toBeDisabled()
    await page.getByTestId('room-next-round').click()
    await expect(voteCard(popup, '8')).toBeEnabled()
    await voteCard(popup, '3').click()
    await expect(tablePlayer(page, 'Demo').locator('.avatar')).toHaveClass(/has-voted/)
    await page.getByTestId('demo-new-team').click()
    await expect.poll(() => popup.isClosed()).toBe(true)
    await expect(page.getByTestId('room-round-label')).toHaveText('Round 1')
    await expect.poll(() => page.getByTestId('room-player').allTextContents()).not.toEqual(roster)
  })

  test('the generic visitor identity leaves the saved profile, Firebase setup, and recent rooms unchanged', async ({ page, context }) => {
    const config = encodeFirebaseConfig(validFirebaseConfig)
    await page.addInitScript(({ savedConfig }) => {
      localStorage.setItem('refinimo_config', savedConfig)
      localStorage.setItem('refinimo_user_id', 'existing-visitor')
      localStorage.setItem('refinimo_user_name', 'Alex')
      localStorage.setItem('refinimo_recent_rooms', JSON.stringify([{ id: 'real-room', name: 'Real sprint', joinedAt: 1 }]))
      localStorage.setItem('refinimo_external_dock_context', JSON.stringify({ roomId: 'real-room', roomName: 'Real sprint', updatedAt: 1 }))
    }, { savedConfig: config })
    const backendRequests: string[] = []
    page.on('request', request => {
      if (/__firebase-mock|firebaseio\.com|firebasedatabase\.app/.test(request.url())) {
        backendRequests.push(request.url())
      }
    })
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/demo')
    await expect(tablePlayer(page, 'Demo')).toHaveClass(/is-you/)
    await expect(page.getByTestId('user-menu-button')).toHaveText('Demo')
    await expect(page).toHaveTitle(/Demo.*Practice room/)
    const readStorage = () => page.evaluate(() => ['refinimo_user_name', 'refinimo_config', 'refinimo_recent_rooms', 'refinimo_external_dock_context'].map(key => localStorage.getItem(key)))
    const original = await readStorage()
    expect(original[0]).toBe('Alex')
    await voteCard(page, '3').click()
    await page.getByTestId('room-reveal-votes').click()
    await page.getByTestId('room-next-round').click()
    await page.getByTestId('room-share-link').click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/demo$/)
    await page.getByTestId('user-menu-button').click()
    await expect(page.getByTestId('user-menu-configuration')).toHaveCount(0)
    await page.keyboard.press('Escape')
    await page.getByTestId('demo-exit').click()
    await expect(page).toHaveURL('/')
    expect(await readStorage()).toEqual(original)
    expect(backendRequests).toEqual([])
  })

  for (const mode of ['light', 'dark']) {
    test(`a visitor can play a round on a phone in ${mode} mode`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.addInitScript(themeMode => {
        localStorage.setItem('refinimo_theme_mode', themeMode)
      }, mode)
      await page.goto('/demo')
      await voteCard(page, '5').click()
      await page.getByTestId('room-reveal-votes').click()
      await page.getByTestId('room-next-round').click()
      await expect(page.getByTestId('room-round-label')).toHaveText('Round 2')
      const sizes = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }))
      expect(sizes.content).toBeLessThanOrEqual(sizes.viewport)
      await page.screenshot({ path: testInfo.outputPath(`demo-mobile-${mode}.png`) })
      await page.getByTestId('demo-exit').click()
      await expect(page).toHaveURL('/')
    })
  }
})
