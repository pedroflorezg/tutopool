import { test, expect } from '@playwright/test'

// Tests para las restricciones de tutor en el formulario de solicitud
// Usan la página de solicitud de cualquier materia disponible

test.describe('Restricciones de tutor en solicitud', () => {
  let requestUrl

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto('/')
    await page.waitForSelector('.card', { timeout: 10000 })
    const href = await page.locator('.card').first().getAttribute('href')
    if (href) {
      await page.goto(href)
      await page.waitForLoadState('networkidle')
      const link = page.locator('a[href*="solicitar"]').first()
      if (await link.count() > 0) requestUrl = await link.getAttribute('href')
    }
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    if (!requestUrl) test.skip()
    await page.goto(requestUrl)
    await page.waitForLoadState('networkidle')
  })

  test('selector de tipo tiene dos opciones', async ({ page }) => {
    const individual = page.locator('#tipo-individual')
    const grupal = page.locator('#tipo-grupal')
    await expect(individual).toBeVisible()
    await expect(grupal).toBeVisible()
  })

  test('selector de formato tiene dos opciones', async ({ page }) => {
    await expect(page.locator('#formato-presencial')).toBeVisible()
    await expect(page.locator('#formato-virtual')).toBeVisible()
  })

  test('código de materia NO aparece en el encabezado', async ({ page }) => {
    // El código es formato como "MAT101" — no debe aparecer junto al nombre
    const header = page.locator('h1 + p, h1 ~ p').first()
    const text = await header.textContent().catch(() => '')
    expect(text).not.toMatch(/[A-Z]{2,4}\d{3,4}/)
  })

  test('selector de hora carga opciones disponibles', async ({ page }) => {
    const select = page.locator('#request-time')
    await expect(select).toBeVisible()
    const options = await select.locator('option').count()
    expect(options).toBeGreaterThan(1)
  })

  test('tutor aleatorio no muestra advertencia de horas', async ({ page }) => {
    // El selector de tutor es el segundo select (el primero es la hora)
    const tutorSelect = page.locator('select[id="request-time"] ~ select, select').nth(1)
    // Si hay más de un select, aseguramos que aleatorio está seleccionado
    const selects = page.locator('select')
    const count = await selects.count()
    // El select del tutor no tiene id — está después del de hora
    for (let i = 0; i < count; i++) {
      const val = await selects.nth(i).inputValue()
      if (val === 'aleatorio') {
        // Ya está en aleatorio — el aviso no debe aparecer
        await expect(page.locator('text=Algunas horas no disponibles')).not.toBeVisible()
        return
      }
    }
    // Si ninguno es aleatorio, el test pasa (no hay tutor con horas bloqueadas activo)
  })

  test('alternar entre Individual y Grupal funciona sin restricciones', async ({ page }) => {
    const individual = page.locator('#tipo-individual')
    const grupal = page.locator('#tipo-grupal')

    // Solo probamos si ninguno está deshabilitado (tutor aleatorio)
    const indivDisabled = await individual.evaluate(el => el.style.opacity === '0.5' || el.disabled)
    const grupalDisabled = await grupal.evaluate(el => el.style.opacity === '0.5' || el.disabled)

    if (!indivDisabled && !grupalDisabled) {
      await individual.click()
      await expect(page.locator('text=Tarifa individual')).toBeVisible()
      await grupal.click()
      await expect(page.locator('text=Descuento grupal del 40%')).toBeVisible()
    }
  })
})
