import { test, expect } from '@playwright/test'

test.describe('Navegación global', () => {
  test('navbar tiene logo que lleva a home', async ({ page }) => {
    await page.goto('/login')
    const logo = page.locator('nav a[href="/"], nav a:has-text("TutoPool")').first()
    await expect(logo).toBeVisible()
    await logo.click()
    await expect(page).toHaveURL('/')
  })

  test('navbar muestra botones de login y registro si no autenticado', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href*="login"], button:has-text("Iniciar")')).toBeVisible()
    await expect(page.locator('a[href*="registro"], button:has-text("Registr")')).toBeVisible()
  })

  test('página 404 muestra mensaje de error', async ({ page }) => {
    await page.goto('/ruta-que-no-existe-xyz')
    await expect(page.locator('text=/404|no encontr|not found/i').first()).toBeVisible()
  })

  test('404 tiene enlace para volver a home', async ({ page }) => {
    await page.goto('/ruta-que-no-existe-xyz')
    const homeLink = page.locator('a[href="/"], button:has-text("Inicio"), a:has-text("Inicio")')
    await expect(homeLink.first()).toBeVisible()
  })

  test('/mis-tutorias sin auth redirige a login', async ({ page }) => {
    await page.goto('/mis-tutorias')
    await page.waitForTimeout(2000)
    expect(page.url()).toMatch(/login/)
  })

  test('/tutor/dashboard sin auth redirige a login', async ({ page }) => {
    await page.goto('/tutor/dashboard')
    await page.waitForTimeout(2000)
    expect(page.url()).toMatch(/login/)
  })

  test('/admin sin auth redirige a home', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(2000)
    expect(page.url()).not.toMatch(/admin/)
  })
})
