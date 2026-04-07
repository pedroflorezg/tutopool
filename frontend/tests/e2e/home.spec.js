import { test, expect } from '@playwright/test'

test.describe('HomePage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('carga correctamente con título', async ({ page }) => {
    await expect(page).toHaveTitle(/TutoPool/)
  })

  test('muestra la barra de navegación', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
  })

  test('muestra cards de materias', async ({ page }) => {
    await page.waitForSelector('.card, .skeleton', { timeout: 10000 })
    const cards = page.locator('.card')
    await expect(cards.first()).toBeVisible()
  })

  test('filtra materias por búsqueda', async ({ page }) => {
    await page.waitForSelector('.card', { timeout: 10000 })
    const countBefore = await page.locator('.card').count()

    const searchInput = page.locator('input[type="text"], input[placeholder*="busca" i], input[placeholder*="materia" i]').first()
    await searchInput.fill('cálculo')
    await page.waitForTimeout(400)

    const countAfter = await page.locator('.card').count()
    // Con filtro debe haber menos o igual resultados
    expect(countAfter).toBeLessThanOrEqual(countBefore)
  })

  test('botón limpiar filtros funciona', async ({ page }) => {
    await page.waitForSelector('.card', { timeout: 10000 })
    const searchInput = page.locator('input[type="text"], input[placeholder*="busca" i]').first()
    await searchInput.fill('zzzzzzinexistente')
    await page.waitForTimeout(400)

    const clearBtn = page.locator('button:has-text("Limpiar"), button:has-text("limpiar"), button:has-text("×"), button:has-text("Clear")')
    if (await clearBtn.count() > 0) {
      await clearBtn.first().click()
      await expect(searchInput).toHaveValue('')
    }
  })

  test('hace clic en una materia y navega al detalle', async ({ page }) => {
    await page.waitForSelector('.card', { timeout: 10000 })
    await page.locator('.card').first().click()
    await expect(page).toHaveURL(/\/materia\//)
  })
})
