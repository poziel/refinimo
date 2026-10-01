import { expect, type Page, test } from '@playwright/test'

async function givenTheLandingPageIsOpen (page: Page) {
  await page.goto('/')
  await expect(page).toHaveTitle(/Refinimo/)
}

async function whenTheVisitorOpensTheDatabasePage (page: Page) {
  await page.getByTestId('landing-tab-database').click()
}

async function whenTheVisitorOpensTheAboutTab (page: Page) {
  await page.getByTestId('landing-tab-about').click()
}

function demoVote (page: Page, value: string) {
  return page.getByTestId('landing-demo-vote').and(page.locator(`[data-card-value="${value}"]`))
}

async function thenTheHeroIllustrationHasLoaded (page: Page) {
  const illustration = page.getByTestId('landing-hero-image')
  await illustration.scrollIntoViewIfNeeded()
  await expect(illustration).toHaveAccessibleName('Planning cards revealed around a shared table')
  await expect.poll(() => illustration.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
}

test.describe('Feature: Landing page discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://api.github.com/repos/poziel/refinimo', async route => {
      await route.fulfill({ json: { stargazers_count: 128 } })
    })
  })

  test('Scenario: a visitor can render and navigate the public landing content', async ({ page }) => {
    await givenTheLandingPageIsOpen(page)

    await expect(page.getByRole('heading', {
      name: /Less guessing\.\s*More alignment\./,
    })).toBeVisible()
    await expect(page.getByText('Planning poker that brings every perspective to the table.', { exact: false })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Poziel', exact: true })).toHaveAttribute('href', 'https://poziel.com/')
    await expect(page.getByTestId('landing-primary-action')).toHaveAccessibleName(/Start planning|Open app/)
    await expect(page.getByTestId('landing-final-cta').getByRole('heading')).toHaveText(/Pick a card\.\s*Plan together\./)
    await thenTheHeroIllustrationHasLoaded(page)
    await expect(page.getByTestId('landing-final-action')).toHaveAttribute('href', '/app')
    await expect(page.locator('.landing-footer-copy')).toContainText('Pick a card. Plan together.')

    await page.getByRole('link', { name: 'Setup guide' }).click()
    await expect(page.getByRole('heading', {
      name: /Bring your\s*own database\./,
    })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Show rules' })).toBeVisible()

    await whenTheVisitorOpensTheAboutTab(page)
    await expect(page.getByRole('heading', { name: 'Special thanks to sky0matic' })).toBeVisible()
  })

  test('Scenario: public pages can be shared, refreshed, and revisited with browser history', async ({ page }) => {
    await givenTheLandingPageIsOpen(page)
    await page.getByTestId('landing-tab-features').click()
    await expect(page).toHaveURL('/features')
    await expect(page.getByTestId('landing-tab-features')).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Everything for\s*your next round/)
    await expect(page.locator('#landing-content')).toBeFocused()
    await page.getByRole('button', { name: 'T-shirt', exact: true }).press('Enter')
    await expect(page.getByRole('img', { name: 'T-shirt example cards' })).toBeVisible()
    await expect(page.getByTestId('landing-demo')).toHaveCount(0)
    await expect(page.getByRole('figure', { name: 'Example estimates and discussion' })).toBeVisible()
    await expect(page.getByTestId('features-open-app')).toHaveAttribute('href', '/app')

    await page.getByTestId('features-setup-guide').click()
    await expect(page).toHaveURL('/your-database')
    await page.goBack()
    await expect(page).toHaveURL('/features')
    await expect(page.getByTestId('landing-tab-features')).toHaveAttribute('aria-current', 'page')
    await page.goForward()
    await expect(page).toHaveURL('/your-database')

    for (const [path, title, heading] of [
      ['/features', 'Features', /Everything for\s*your next round/],
      ['/your-database', 'Your database', /Bring your\s*own database/],
      ['/about', 'About & credits', /Good things are\s*built together/],
    ] as const) {
      await page.goto(path)
      await page.reload()
      await expect(page).toHaveTitle(`${title} - Refinimo`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`))
    }
  })

  test('Scenario: the database guide links to setup tools and keeps detailed explanations optional', async ({ page }) => {
    await page.goto('/your-database')
    await expect(page.getByRole('figure', { name: 'Your team\'s browsers connect directly to your Firebase project' })).toBeVisible()
    await expect(page.getByTestId('landing-ownership-detail')).toHaveCount(0)
    await expect(page.getByTestId('database-step')).toHaveCount(3)
    for (const [label, href] of [
      ['Open Firebase Console', 'https://console.firebase.google.com/'],
      ['Open Realtime Database', 'https://console.firebase.google.com/project/_/database/'],
      ['Open Project settings', 'https://console.firebase.google.com/project/_/settings/general/'],
    ]) {
      const link = page.getByRole('link', { name: label, exact: true })
      await expect(link).toHaveAttribute('href', href!)
      await expect(link).toHaveAttribute('target', '_blank')
    }
    const rulesSection = page.getByRole('region', { name: 'Realtime Database rules' })
    await rulesSection.scrollIntoViewIfNeeded()
    await expect(rulesSection).toBeInViewport()
    const storageDetails = page.getByText('Where does our data live?', { exact: true })
    await storageDetails.press('Enter')
    await expect(page.getByRole('heading', { name: 'In your browser' })).toBeVisible()
    await storageDetails.press('Enter')
    await expect(page.getByRole('heading', { name: 'In your browser' })).toBeHidden()
    await page.getByTestId('database-open-app').click()
    await expect(page).toHaveURL('/app')
    await expect(page.getByRole('heading', { name: 'Connect to Firebase' })).toBeVisible()
  })

  test('Scenario: navigation stays centered and clear of the brand and actions', async ({ page }) => {
    for (const width of [1440, 1180, 900, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await givenTheLandingPageIsOpen(page)
      const nav = await page.getByRole('navigation', { name: 'Main navigation', exact: true }).boundingBox()
      const header = await page.locator('.landing-topbar').boundingBox()
      const brand = await page.locator('.landing-topbar > .landing-brand').boundingBox()
      const actions = await page.locator('.landing-header-actions').boundingBox()
      expect(Math.abs((nav!.x + nav!.width / 2) - (header!.x + header!.width / 2))).toBeLessThan(1)
      const overlaps = (a: NonNullable<typeof nav>, b: NonNullable<typeof nav>) =>
        a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
      expect(overlaps(nav!, brand!)).toBe(false)
      expect(overlaps(nav!, actions!)).toBe(false)
    }
  })

  test('Scenario: a visitor can read and copy the Firebase rules, then open configuration', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await givenTheLandingPageIsOpen(page)
    await whenTheVisitorOpensTheDatabasePage(page)
    const rulesSection = page.getByRole('region', { name: 'Realtime Database rules' })
    const configuration = rulesSection.getByTestId('landing-open-configuration')

    await expect(page.getByText('"rooms":')).toHaveCount(0)
    await expect(configuration).toBeVisible()

    await page.getByTestId('landing-toggle-rules').click()
    await expect(page.getByText('"rooms":')).toBeVisible()
    await expect(page.getByTestId('landing-toggle-rules')).toHaveText(/Hide rules/)
    await expect(configuration).toBeVisible()

    await page.getByTestId('landing-copy-rules').click()

    await expect(page.getByText('Firebase rules copied.')).toBeVisible()
    await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toContain('"rooms"')

    await page.getByTestId('landing-toggle-rules').click()
    await expect(page.getByText('"rooms":')).toHaveCount(0)
    await configuration.click()
    await expect(page).toHaveURL(/\/app\/config$/)
    await expect(page.getByTestId('firebase-config-page-form')).toBeVisible()
  })

  test('Scenario: the primary landing action opens the app setup flow', async ({ page }) => {
    await givenTheLandingPageIsOpen(page)

    await page.getByTestId('landing-primary-action').click()

    await expect(page).toHaveURL(/\/app$/)
    await expect(page.getByRole('heading', { name: 'Connect to Firebase' })).toBeVisible()
  })

  test('Scenario: a visitor can try private voting, reveal estimates, and start another round', async ({ page }) => {
    await givenTheLandingPageIsOpen(page)
    const demo = page.getByTestId('landing-demo')
    const reveal = page.getByTestId('landing-demo-reveal')

    await expect(demoVote(page, '5')).toHaveAttribute('aria-pressed', 'true')
    await expect(demo.getByRole('img', { name: /vote hidden/ })).toHaveCount(4)
    await demoVote(page, '13').click()
    await expect(demoVote(page, '13')).toHaveAttribute('aria-pressed', 'true')
    await expect(demoVote(page, '5')).toHaveAttribute('aria-pressed', 'false')
    await expect(demo.getByRole('status')).toContainText('Your vote is 13')
    await expect(demo.getByRole('img', { name: /vote hidden/ })).toHaveCount(4)

    await reveal.click()
    await expect(reveal).toHaveAccessibleName('Start a new round')
    for (const [name, vote] of [['Maya', '3'], ['Jules', '5'], ['Alex', '8'], ['You', '13']]) {
      await expect(demo.getByRole('img', { name: `${name}: ${vote} points`, exact: true })).toBeVisible()
    }
    await expect(demo.getByRole('status')).toContainText('Estimates range from 3 to 13')
    for (const vote of await page.getByTestId('landing-demo-vote').all()) {
      await expect(vote).toBeDisabled()
    }

    await reveal.click()
    await expect(reveal).toHaveAccessibleName('Reveal cards')
    await expect(demo.getByRole('img', { name: /vote hidden/ })).toHaveCount(4)
    await demoVote(page, '?').click()
    await reveal.click()
    await expect(demo.getByRole('img', { name: 'You: ? points', exact: true })).toBeVisible()
    await expect(demo.getByRole('status')).toContainText('Talk through what feels uncertain')
    await expect(page).toHaveURL(/\/$/)
  })

  test('Scenario: Try it out opens a full practice room without setup', async ({ page }) => {
    await givenTheLandingPageIsOpen(page)
    await page.getByTestId('landing-try-preview').press('Enter')
    await expect(page).toHaveURL('/demo')
    await expect(page.getByTestId('demo-session')).toBeVisible()
    await expect(page.getByTestId('room-shell')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.getByTestId('demo-exit').click()
    await expect(page).toHaveURL('/')
  })

  test('Scenario: a visitor can open and close a frequently asked question with the keyboard', async ({ page }) => {
    await givenTheLandingPageIsOpen(page)
    const question = page.getByTestId('landing-faq-0')
    const answer = page.getByText('Yes. Refinimo has no subscription or paid feature tiers.', { exact: false })

    await expect(answer).toBeHidden()
    await question.focus()
    await page.keyboard.press('Enter')
    await expect(answer).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(answer).toBeHidden()
  })

  for (const width of [390, 320, 640]) {
    test(`Scenario: a visitor can use the landing page at ${width}px without horizontal overflow`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 844 })
      await givenTheLandingPageIsOpen(page)

      const expectNoHorizontalOverflow = async () => {
        const sizes = await page.evaluate(() => ({
          content: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
        }))
        expect(sizes.content).toBeLessThanOrEqual(sizes.viewport)
      }

      await expectNoHorizontalOverflow()
      const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
      for (const detail of await page.getByTestId('landing-ownership-detail').or(page.getByTestId('landing-hero-image')).all()) {
        const bounds = await detail.boundingBox()
        expect(bounds).not.toBeNull()
        expect(bounds!.x).toBeGreaterThanOrEqual(0)
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewportWidth)
      }
      if (width === 390) {
        const screenshotPath = testInfo.outputPath('landing-mobile-390.png')
        await page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled' })
        await testInfo.attach('Landing at 390px', { path: screenshotPath, contentType: 'image/png' })
        await page.getByTestId('landing-final-cta').scrollIntoViewIfNeeded()
        await thenTheHeroIllustrationHasLoaded(page)
        const closingScreenshotPath = testInfo.outputPath('landing-closing-mobile-390.png')
        await page.screenshot({ path: closingScreenshotPath, fullPage: false, animations: 'disabled' })
        await testInfo.attach('Closing hero at 390px', { path: closingScreenshotPath, contentType: 'image/png' })
      }
      await demoVote(page, '8').click()
      await page.getByTestId('landing-demo-reveal').click()
      await expect(page.getByTestId('landing-demo').getByRole('img', { name: 'You: 8 points' })).toBeVisible()

      for (const control of await page.getByTestId('landing-demo-vote').all()) {
        const bounds = await control.boundingBox()
        expect(bounds).not.toBeNull()
        expect(bounds!.x).toBeGreaterThanOrEqual(0)
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      }

      await whenTheVisitorOpensTheDatabasePage(page)
      await page.getByTestId('landing-toggle-rules').click()
      await expectNoHorizontalOverflow()
      await page.getByTestId('landing-tab-features').click()
      await expectNoHorizontalOverflow()
      await page.getByRole('button', { name: 'T-shirt', exact: true }).click()
      await expectNoHorizontalOverflow()
      await whenTheVisitorOpensTheAboutTab(page)
      await expectNoHorizontalOverflow()
    })
  }

  test('Scenario: a visitor can navigate and try a round with enlarged text on a small phone', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await givenTheLandingPageIsOpen(page)
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })

    const expectControlsInViewport = async () => {
      const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
      const controls = page.locator('.landing-topbar, .landing-content').locator('button, a, summary')
      for (const control of await controls.all()) {
        if (!await control.isVisible()) {
          continue
        }
        const bounds = await control.boundingBox()
        expect(bounds).not.toBeNull()
        expect(bounds!.x).toBeGreaterThanOrEqual(0)
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewportWidth)
      }
    }

    await expectControlsInViewport()
    await demoVote(page, '5').focus()
    await demoVote(page, '5').press('Enter')
    await page.getByTestId('landing-demo-reveal').press('Enter')
    await expect(page.getByTestId('landing-demo').getByRole('img', { name: 'You: 5 points' })).toBeVisible()
    await page.getByRole('link', { name: 'Setup guide' }).click()
    await expectControlsInViewport()
    await page.getByTestId('landing-tab-features').click()
    await expectControlsInViewport()
    await whenTheVisitorOpensTheAboutTab(page)
    await expectControlsInViewport()
  })

  test('Scenario: switching light and dark themes preserves the preview and the chosen mode', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await givenTheLandingPageIsOpen(page)
    await demoVote(page, '8').click()
    const trigger = page.getByTestId('landing-theme-trigger')

    for (const mode of ['light', 'dark']) {
      await trigger.scrollIntoViewIfNeeded()
      await trigger.click()
      await page.getByTestId(`landing-theme-mode-${mode}`).click()
      await expect(trigger).toHaveAccessibleName(new RegExp(`Theme: .* ${mode}$`))
      await expect(page.getByTestId(`landing-theme-mode-${mode}`)).toBeHidden()
      await expect(demoVote(page, '8')).toHaveAttribute('aria-pressed', 'true')
      await expect(page.getByTestId('landing-demo-reveal')).toBeVisible()
      const screenshotPath = testInfo.outputPath(`landing-${mode}-1440.png`)
      await page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled' })
      await testInfo.attach(`Landing ${mode} at 1440px`, { path: screenshotPath, contentType: 'image/png' })
      await page.getByTestId('landing-final-cta').scrollIntoViewIfNeeded()
      await thenTheHeroIllustrationHasLoaded(page)
      const closingScreenshotPath = testInfo.outputPath(`landing-closing-${mode}-1440.png`)
      await page.screenshot({ path: closingScreenshotPath, fullPage: false, animations: 'disabled' })
      await testInfo.attach(`Closing hero ${mode} at 1440px`, { path: closingScreenshotPath, contentType: 'image/png' })
    }

    await page.reload()
    await expect(trigger).toHaveAccessibleName(/Theme: .* dark$/)
  })
})
