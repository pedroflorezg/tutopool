import { test as base } from '@playwright/test'

// Fixture que inicia sesión como admin antes del test
export const test = base.extend({
  adminPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL || 'pedro.florez.g@gmail.com')
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || '')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
    await use(page)
  },
})

export { expect } from '@playwright/test'
