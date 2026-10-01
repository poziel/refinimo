import { expect, test } from '@playwright/test'

const repositoryApi = 'https://api.github.com/repos/poziel/refinimo'

test.describe('Feature: Landing GitHub stars', () => {
  for (const count of [128, 0]) {
    test(`Scenario: the repository link shows its real count of ${count} stars`, async ({ page }) => {
      await page.route(repositoryApi, route => route.fulfill({ json: { stargazers_count: count } }))
      await page.goto('/')

      const link = page.getByTestId('landing-github')
      await expect(link).toHaveAttribute('href', 'https://github.com/poziel/refinimo')
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      await expect(link).toHaveAccessibleName(`Refinimo on GitHub, ${count} stars (opens in a new tab)`)
      await expect(page.getByTestId('landing-github-stars')).toHaveText(String(count))
    })
  }

  for (const unavailable of [
    { name: 'rate limited', status: 403, body: '{"message":"API rate limit exceeded"}' },
    { name: 'invalid count', status: 200, body: '{"stargazers_count":-1}' },
    { name: 'malformed response', status: 200, body: 'not JSON' },
  ]) {
    test(`Scenario: the GitHub link remains usable with a ${unavailable.name}`, async ({ page }) => {
      await page.route(repositoryApi, route => route.fulfill({
        status: unavailable.status,
        contentType: 'application/json',
        body: unavailable.body,
      }))
      const response = page.waitForResponse(repositoryApi)
      await page.goto('/')
      await (await response).finished()

      await expect(page.getByTestId('landing-github')).toBeVisible()
      await expect(page.getByTestId('landing-github')).toHaveAccessibleName('Refinimo on GitHub (opens in a new tab)')
      await expect(page.getByTestId('landing-github-stars')).toHaveCount(0)
      await expect(page.getByTestId('landing-primary-action')).toBeVisible()
    })
  }

  test('Scenario: a recently fetched star count is reused after reloading the page', async ({ page }) => {
    let requests = 0
    await page.route(repositoryApi, route => {
      requests += 1
      return route.fulfill({ json: { stargazers_count: 42 } })
    })
    await page.goto('/')
    await expect(page.getByTestId('landing-github-stars')).toHaveText('42')

    await page.reload()

    await expect(page.getByTestId('landing-github-stars')).toHaveText('42')
    expect(requests).toBe(1)
  })
})
