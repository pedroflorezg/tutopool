import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('muestra el formulario de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('redirige a / al iniciar sesión correctamente', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL || '')
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || '')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/')
  })

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'invalido@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/error|inválid|incorrect/i')).toBeVisible()
  })
})
