# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pools/subject-detail.spec.js >> SubjectDetailPage >> botón volver navega a home
- Location: tests/e2e/pools/subject-detail.spec.js:30:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "https://tutopool.vercel.app/"
Received: "about:blank"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "about:blank"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('SubjectDetailPage', () => {
  4  |   let subjectUrl
  5  | 
  6  |   test.beforeAll(async ({ browser }) => {
  7  |     const page = await browser.newPage()
  8  |     await page.goto('/')
  9  |     await page.waitForSelector('.card', { timeout: 10000 })
  10 |     await page.locator('.card').first().click()
  11 |     await page.waitForURL(/\/materia\//)
  12 |     subjectUrl = page.url()
  13 |     await page.close()
  14 |   })
  15 | 
  16 |   test.beforeEach(async ({ page }) => {
  17 |     await page.goto(subjectUrl)
  18 |     await page.waitForLoadState('networkidle')
  19 |   })
  20 | 
  21 |   test('muestra nombre de la materia', async ({ page }) => {
  22 |     await expect(page.locator('h1, h2').first()).toBeVisible()
  23 |   })
  24 | 
  25 |   test('tiene botón de volver', async ({ page }) => {
  26 |     const backBtn = page.locator('button:has-text("Volver"), a:has-text("Volver"), button:has-text("←")')
  27 |     await expect(backBtn.first()).toBeVisible()
  28 |   })
  29 | 
  30 |   test('botón volver navega a home', async ({ page }) => {
  31 |     const backBtn = page.locator('button:has-text("Volver"), a:has-text("Volver"), button:has-text("←")').first()
  32 |     await backBtn.click()
> 33 |     await expect(page).toHaveURL('/')
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  34 |   })
  35 | 
  36 |   test('tiene CTA de solicitar tutoría', async ({ page }) => {
  37 |     const cta = page.locator('a[href*="solicitar"], button:has-text("Solicitar")')
  38 |     await expect(cta.first()).toBeVisible()
  39 |   })
  40 | 
  41 |   test('botón unirse redirige a login si no autenticado', async ({ page }) => {
  42 |     const joinBtn = page.locator('a[href*="unirse"], button:has-text("Unirme"), button:has-text("Unirse")')
  43 |     if (await joinBtn.count() > 0) {
  44 |       await joinBtn.first().click()
  45 |       await page.waitForTimeout(1500)
  46 |       const url = page.url()
  47 |       // Debe ir a /unirse/:id o /login
  48 |       expect(url).toMatch(/unirse|login/)
  49 |     }
  50 |   })
  51 | })
  52 | 
```