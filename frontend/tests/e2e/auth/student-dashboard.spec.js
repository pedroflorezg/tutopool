import { test, expect } from '@playwright/test'

test.describe('StudentDashboard', () => {
  test('redirige a /login si no autenticado', async ({ page }) => {
    await page.goto('/mis-tutorias')
    await page.waitForTimeout(2000)
    expect(page.url()).toMatch(/login/)
  })
})

test.describe('StudentLoginPage - campos básicos', () => {
  test('muestra campo email y contraseña', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('muestra enlace de registro desde login', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.locator('a[href*="registro"], a[href*="register"]').first()
    await expect(registerLink).toBeVisible()
  })

  test('error visible con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', 'no-existe@test.com')
    await page.fill('input[type="password"]', 'wrongpassword123')
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(3000)
    // Debe mostrar algún mensaje de error
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toMatch(/error|inválid|incorrect|credencial/i)
  })
})
