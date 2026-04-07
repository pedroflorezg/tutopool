# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pools/request-tutoring.spec.js >> RequestTutoringPage >> enviar sin auth redirige a login
- Location: tests/e2e/pools/request-tutoring.spec.js:67:3

# Error details

```
"beforeAll" hook timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - link "TP TutoPool" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: TP
        - generic [ref=e7]: TutoPool
      - generic [ref=e8]:
        - link "Materias" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "Portal Tutor" [ref=e10] [cursor=pointer]:
          - /url: /tutor/dashboard
        - link "Iniciar sesión" [ref=e11] [cursor=pointer]:
          - /url: /login
        - link "Registrarse" [ref=e12] [cursor=pointer]:
          - /url: /registro
  - main [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e17]:
        - paragraph [ref=e18]: Universidad EIA · Medellín
        - heading "Encuentra tu tutoría" [level=1] [ref=e19]
        - paragraph [ref=e20]:
          - text: Únete a grupos de estudio con
          - strong [ref=e21]: 40% de descuento
          - text: o solicita una sesión personalizada.
        - generic [ref=e22]:
          - generic [ref=e23]: Pools grupales — 40% de descuento
          - generic [ref=e25]: Presencial o virtual
          - generic [ref=e27]: Confirmación por WhatsApp
        - generic [ref=e29]:
          - generic [ref=e30]:
            - img [ref=e31]
            - textbox "Buscar por nombre o código (ej. MAT101, Cálculo…)" [ref=e33]
          - generic [ref=e34]:
            - combobox [ref=e35] [cursor=pointer]:
              - option "Todos los programas" [selected]
              - option "Administración de Negocios"
              - option "Ciencias del Deporte y la Actividad Física"
              - option "Economía"
              - option "Ingeniería Biomédica"
              - option "Ingeniería Civil"
              - option "Ingeniería de Sistemas y Computación"
              - option "Ingeniería Electrónica"
              - option "Ingeniería Industrial"
              - option "Ingeniería Mecánica"
              - option "Medicina"
              - option "Psicología"
            - combobox [ref=e36] [cursor=pointer]:
              - option "Semestre" [selected]
              - option "Semestre 1"
              - option "Semestre 2"
              - option "Semestre 3"
              - option "Semestre 4"
              - option "Semestre 5"
              - option "Semestre 6"
              - option "Semestre 7"
              - option "Semestre 8"
              - option "Semestre 9"
              - option "Semestre 10"
      - generic [ref=e37]:
        - paragraph [ref=e39]: 29 materias encontradas
        - generic [ref=e40]:
          - link "Álgebra Lineal ✓ Pool abierto 👤 Carlos Rodríguez Martínez" [ref=e41] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000003
            - generic [ref=e42]:
              - heading "Álgebra Lineal" [level=3] [ref=e43]
              - generic [ref=e44]: ✓ Pool abierto
            - generic [ref=e46]:
              - generic [ref=e47]: 👤
              - text: Carlos Rodríguez Martínez
          - link "Algoritmos y Complejidad 👤 María García López" [ref=e48] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000014
            - heading "Algoritmos y Complejidad" [level=3] [ref=e50]
            - generic [ref=e52]:
              - generic [ref=e53]: 👤
              - text: María García López
          - link "Análisis Estructural 👤 Sebastián Ospina Ríos" [ref=e54] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000023
            - heading "Análisis Estructural" [level=3] [ref=e56]
            - generic [ref=e58]:
              - generic [ref=e59]: 👤
              - text: Sebastián Ospina Ríos
          - link "Anatomía Humana ✓ Pool abierto 👤 Dr. Javier Morales" [ref=e60] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000030
            - generic [ref=e61]:
              - heading "Anatomía Humana" [level=3] [ref=e62]
              - generic [ref=e63]: ✓ Pool abierto
            - generic [ref=e65]:
              - generic [ref=e66]: 👤
              - text: Dr. Javier Morales
          - link "Bases de Datos ✓ Pool abierto 👤 María García López" [ref=e67] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000013
            - generic [ref=e68]:
              - heading "Bases de Datos" [level=3] [ref=e69]
              - generic [ref=e70]: ✓ Pool abierto
            - generic [ref=e72]:
              - generic [ref=e73]: 👤
              - text: María García López
          - link "Bioquímica 👤 Dr. Javier Morales" [ref=e74] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000031
            - heading "Bioquímica" [level=3] [ref=e76]
            - generic [ref=e78]:
              - generic [ref=e79]: 👤
              - text: Dr. Javier Morales
          - link "Cálculo Diferencial ✓ Pool abierto 👤 Carlos Rodríguez Martínez" [ref=e80] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000001
            - generic [ref=e81]:
              - heading "Cálculo Diferencial" [level=3] [ref=e82]
              - generic [ref=e83]: ✓ Pool abierto
            - generic [ref=e85]:
              - generic [ref=e86]: 👤
              - text: Carlos Rodríguez Martínez
          - link "Cálculo Integral 👤 Carlos Rodríguez Martínez" [ref=e87] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000002
            - heading "Cálculo Integral" [level=3] [ref=e89]
            - generic [ref=e91]:
              - generic [ref=e92]: 👤
              - text: Carlos Rodríguez Martínez
          - link "Cálculo Vectorial 👤 Carlos Rodríguez Martínez" [ref=e93] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000004
            - heading "Cálculo Vectorial" [level=3] [ref=e95]
            - generic [ref=e97]:
              - generic [ref=e98]: 👤
              - text: Carlos Rodríguez Martínez
          - link "Circuitos Eléctricos I 👤 Valentina Torres Pérez" [ref=e99] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000027
            - heading "Circuitos Eléctricos I" [level=3] [ref=e101]
            - generic [ref=e103]:
              - generic [ref=e104]: 👤
              - text: Valentina Torres Pérez
          - link "Contabilidad General ✓ Pool abierto 👤 Ana Sofía Hernández" [ref=e105] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000033
            - generic [ref=e106]:
              - heading "Contabilidad General" [level=3] [ref=e107]
              - generic [ref=e108]: ✓ Pool abierto
            - generic [ref=e110]:
              - generic [ref=e111]: 👤
              - text: Ana Sofía Hernández
          - link "Ecuaciones Diferenciales 👤 Carlos Rodríguez Martínez" [ref=e112] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000005
            - heading "Ecuaciones Diferenciales" [level=3] [ref=e114]
            - generic [ref=e116]:
              - generic [ref=e117]: 👤
              - text: Carlos Rodríguez Martínez
          - link "Electrónica Analógica 👤 Valentina Torres Pérez" [ref=e118] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000029
            - heading "Electrónica Analógica" [level=3] [ref=e120]
            - generic [ref=e122]:
              - generic [ref=e123]: 👤
              - text: Valentina Torres Pérez
          - link "Estructuras de Datos ✓ Pool abierto 👤 María García López" [ref=e124] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000012
            - generic [ref=e125]:
              - heading "Estructuras de Datos" [level=3] [ref=e126]
              - generic [ref=e127]: ✓ Pool abierto
            - generic [ref=e129]:
              - generic [ref=e130]: 👤
              - text: María García López
          - link "Finanzas Corporativas 👤 Ana Sofía Hernández" [ref=e131] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000036
            - heading "Finanzas Corporativas" [level=3] [ref=e133]
            - generic [ref=e135]:
              - generic [ref=e136]: 👤
              - text: Ana Sofía Hernández
          - link "Física Eléctrica y Óptica 👤 Carlos Rodríguez Martínez 👤 Valentina Torres Pérez" [ref=e137] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000008
            - heading "Física Eléctrica y Óptica" [level=3] [ref=e139]
            - generic [ref=e140]:
              - generic [ref=e141]:
                - generic [ref=e142]: 👤
                - text: Carlos Rodríguez Martínez
              - generic [ref=e143]:
                - generic [ref=e144]: 👤
                - text: Valentina Torres Pérez
          - link "Física Mecánica 👤 Carlos Rodríguez Martínez" [ref=e145] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000007
            - heading "Física Mecánica" [level=3] [ref=e147]
            - generic [ref=e149]:
              - generic [ref=e150]: 👤
              - text: Carlos Rodríguez Martínez
          - link "Fisiología del Ejercicio 👤 Dr. Javier Morales" [ref=e151] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000039
            - heading "Fisiología del Ejercicio" [level=3] [ref=e153]
            - generic [ref=e155]:
              - generic [ref=e156]: 👤
              - text: Dr. Javier Morales
          - link "Fisiología Humana 👤 Dr. Javier Morales" [ref=e157] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000032
            - heading "Fisiología Humana" [level=3] [ref=e159]
            - generic [ref=e161]:
              - generic [ref=e162]: 👤
              - text: Dr. Javier Morales
          - link "Macroeconomía 👤 Ana Sofía Hernández" [ref=e163] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000035
            - heading "Macroeconomía" [level=3] [ref=e165]
            - generic [ref=e167]:
              - generic [ref=e168]: 👤
              - text: Ana Sofía Hernández
          - link "Mecánica de Fluidos 👤 Sebastián Ospina Ríos" [ref=e169] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000022
            - heading "Mecánica de Fluidos" [level=3] [ref=e171]
            - generic [ref=e173]:
              - generic [ref=e174]: 👤
              - text: Sebastián Ospina Ríos
          - link "Mecánica de Sólidos 👤 Sebastián Ospina Ríos" [ref=e175] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000025
            - heading "Mecánica de Sólidos" [level=3] [ref=e177]
            - generic [ref=e179]:
              - generic [ref=e180]: 👤
              - text: Sebastián Ospina Ríos
          - link "Microeconomía 👤 Ana Sofía Hernández" [ref=e181] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000034
            - heading "Microeconomía" [level=3] [ref=e183]
            - generic [ref=e185]:
              - generic [ref=e186]: 👤
              - text: Ana Sofía Hernández
          - link "Probabilidad y Estadística 👤 Ana Sofía Hernández" [ref=e187] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000006
            - heading "Probabilidad y Estadística" [level=3] [ref=e189]
            - generic [ref=e191]:
              - generic [ref=e192]: 👤
              - text: Ana Sofía Hernández
          - link "Programación I ✓ Pool abierto 👤 María García López" [ref=e193] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000010
            - generic [ref=e194]:
              - heading "Programación I" [level=3] [ref=e195]
              - generic [ref=e196]: ✓ Pool abierto
            - generic [ref=e198]:
              - generic [ref=e199]: 👤
              - text: María García López
          - link "Programación II 👤 María García López" [ref=e200] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000011
            - heading "Programación II" [level=3] [ref=e202]
            - generic [ref=e204]:
              - generic [ref=e205]: 👤
              - text: María García López
          - link "Resistencia de Materiales 👤 Sebastián Ospina Ríos" [ref=e206] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000021
            - heading "Resistencia de Materiales" [level=3] [ref=e208]
            - generic [ref=e210]:
              - generic [ref=e211]: 👤
              - text: Sebastián Ospina Ríos
          - link "Señales y Sistemas 👤 Valentina Torres Pérez" [ref=e212] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000028
            - heading "Señales y Sistemas" [level=3] [ref=e214]
            - generic [ref=e216]:
              - generic [ref=e217]: 👤
              - text: Valentina Torres Pérez
          - link "Termodinámica 👤 Sebastián Ospina Ríos" [ref=e218] [cursor=pointer]:
            - /url: /materia/b1000000-0000-0000-0000-000000000024
            - heading "Termodinámica" [level=3] [ref=e220]
            - generic [ref=e222]:
              - generic [ref=e223]: 👤
              - text: Sebastián Ospina Ríos
  - contentinfo [ref=e224]:
    - generic [ref=e225]:
      - generic [ref=e226]: TutoPool
      - paragraph [ref=e227]: © 2026 Universidad EIA · Todos los derechos reservados.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('RequestTutoringPage', () => {
  4  |   let requestUrl
  5  | 
> 6  |   test.beforeAll(async ({ browser }) => {
     |        ^ "beforeAll" hook timeout of 30000ms exceeded.
  7  |     const page = await browser.newPage()
  8  |     await page.goto('/')
  9  |     await page.waitForSelector('.card', { timeout: 10000 })
  10 |     const firstCard = page.locator('.card').first()
  11 |     const href = await firstCard.locator('a').first().getAttribute('href')
  12 |     await page.goto(href || '/')
  13 |     await page.waitForLoadState('networkidle')
  14 |     // Find solicitar link
  15 |     const solicitarLink = page.locator('a[href*="solicitar"]').first()
  16 |     if (await solicitarLink.count() > 0) {
  17 |       requestUrl = await solicitarLink.getAttribute('href')
  18 |     }
  19 |     await page.close()
  20 |   })
  21 | 
  22 |   test.beforeEach(async ({ page }) => {
  23 |     if (requestUrl) {
  24 |       await page.goto(requestUrl)
  25 |       await page.waitForLoadState('networkidle')
  26 |     } else {
  27 |       test.skip()
  28 |     }
  29 |   })
  30 | 
  31 |   test('muestra selector de tipo (Individual / Grupal)', async ({ page }) => {
  32 |     await expect(page.locator('button:has-text("Individual"), label:has-text("Individual")')).toBeVisible()
  33 |     await expect(page.locator('button:has-text("Grupal"), label:has-text("Grupal")')).toBeVisible()
  34 |   })
  35 | 
  36 |   test('muestra selector de formato (Presencial / Virtual)', async ({ page }) => {
  37 |     await expect(page.locator('button:has-text("Presencial"), label:has-text("Presencial")')).toBeVisible()
  38 |     await expect(page.locator('button:has-text("Virtual"), label:has-text("Virtual")')).toBeVisible()
  39 |   })
  40 | 
  41 |   test('muestra selector de fecha', async ({ page }) => {
  42 |     await expect(page.locator('input[type="date"]')).toBeVisible()
  43 |   })
  44 | 
  45 |   test('muestra selector de hora', async ({ page }) => {
  46 |     await expect(page.locator('select, input[type="time"]').first()).toBeVisible()
  47 |   })
  48 | 
  49 |   test('muestra precio en tiempo real', async ({ page }) => {
  50 |     await expect(page.locator('text=/\\$|COP|precio/i').first()).toBeVisible()
  51 |   })
  52 | 
  53 |   test('alternar tipo cambia precio', async ({ page }) => {
  54 |     const individual = page.locator('button:has-text("Individual")').first()
  55 |     const grupal = page.locator('button:has-text("Grupal")').first()
  56 | 
  57 |     if (await individual.count() > 0 && await grupal.count() > 0) {
  58 |       await individual.click()
  59 |       const priceIndividual = await page.locator('text=/\\$[0-9]|[0-9]+.*COP/').first().innerText().catch(() => '')
  60 |       await grupal.click()
  61 |       const priceGrupal = await page.locator('text=/\\$[0-9]|[0-9]+.*COP/').first().innerText().catch(() => '')
  62 |       // Los precios deben ser distintos (grupal tiene descuento)
  63 |       expect(priceIndividual).not.toBe(priceGrupal)
  64 |     }
  65 |   })
  66 | 
  67 |   test('enviar sin auth redirige a login', async ({ page }) => {
  68 |     const submitBtn = page.locator('button[type="submit"]').first()
  69 |     await submitBtn.click()
  70 |     await page.waitForTimeout(2000)
  71 |     expect(page.url()).toMatch(/login|solicitar/)
  72 |   })
  73 | })
  74 | 
```