# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/register.spec.js >> Registro tutor >> muestra campo de teléfono
- Location: tests/e2e/auth/register.spec.js:37:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[type="tel"], input[name*="telefono"], input[placeholder*="teléfono" i]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[type="tel"], input[name*="telefono"], input[placeholder*="teléfono" i]').first()

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
    - generic [ref=e15]:
      - generic [ref=e16]:
        - heading "Portal Tutores" [level=1] [ref=e17]
        - paragraph [ref=e18]: Regístrate para comenzar a impartir tutorías
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Nombre completo
          - textbox "Nombre completo" [ref=e22]:
            - /placeholder: "Ej: Ana María Rico"
        - generic [ref=e23]:
          - generic [ref=e24]: Email
          - textbox "Email" [ref=e25]:
            - /placeholder: tu@eia.edu.co
        - generic [ref=e26]:
          - generic [ref=e27]: WhatsApp/Teléfono
          - textbox "WhatsApp/Teléfono" [ref=e28]:
            - /placeholder: "Ej: +57 321 000 0000"
        - generic [ref=e29]:
          - generic [ref=e30]: Contraseña
          - textbox "Contraseña" [ref=e31]:
            - /placeholder: Mínimo 6 caracteres
        - generic [ref=e32]:
          - generic [ref=e33]: Materias que enseñas
          - paragraph [ref=e34]: Selecciona todas las que apliquen
          - generic [ref=e35]:
            - generic [ref=e36] [cursor=pointer]:
              - checkbox "Álgebra Lineal" [ref=e37]
              - text: Álgebra Lineal
            - generic [ref=e38] [cursor=pointer]:
              - checkbox "Algoritmos y Complejidad" [ref=e39]
              - text: Algoritmos y Complejidad
            - generic [ref=e40] [cursor=pointer]:
              - checkbox "Análisis Estructural" [ref=e41]
              - text: Análisis Estructural
            - generic [ref=e42] [cursor=pointer]:
              - checkbox "Anatomía Humana" [ref=e43]
              - text: Anatomía Humana
            - generic [ref=e44] [cursor=pointer]:
              - checkbox "Bases de Datos" [ref=e45]
              - text: Bases de Datos
            - generic [ref=e46] [cursor=pointer]:
              - checkbox "Bioquímica" [ref=e47]
              - text: Bioquímica
            - generic [ref=e48] [cursor=pointer]:
              - checkbox "Cálculo Diferencial" [ref=e49]
              - text: Cálculo Diferencial
            - generic [ref=e50] [cursor=pointer]:
              - checkbox "Cálculo Integral" [ref=e51]
              - text: Cálculo Integral
            - generic [ref=e52] [cursor=pointer]:
              - checkbox "Cálculo Vectorial" [ref=e53]
              - text: Cálculo Vectorial
            - generic [ref=e54] [cursor=pointer]:
              - checkbox "Circuitos Eléctricos I" [ref=e55]
              - text: Circuitos Eléctricos I
            - generic [ref=e56] [cursor=pointer]:
              - checkbox "Contabilidad General" [ref=e57]
              - text: Contabilidad General
            - generic [ref=e58] [cursor=pointer]:
              - checkbox "Dinámica de Máquinas" [ref=e59]
              - text: Dinámica de Máquinas
            - generic [ref=e60] [cursor=pointer]:
              - checkbox "Ecuaciones Diferenciales" [ref=e61]
              - text: Ecuaciones Diferenciales
            - generic [ref=e62] [cursor=pointer]:
              - checkbox "Electrónica Analógica" [ref=e63]
              - text: Electrónica Analógica
            - generic [ref=e64] [cursor=pointer]:
              - checkbox "Estructuras de Datos" [ref=e65]
              - text: Estructuras de Datos
            - generic [ref=e66] [cursor=pointer]:
              - checkbox "Finanzas Corporativas" [ref=e67]
              - text: Finanzas Corporativas
            - generic [ref=e68] [cursor=pointer]:
              - checkbox "Física Eléctrica y Óptica" [ref=e69]
              - text: Física Eléctrica y Óptica
            - generic [ref=e70] [cursor=pointer]:
              - checkbox "Física Mecánica" [ref=e71]
              - text: Física Mecánica
            - generic [ref=e72] [cursor=pointer]:
              - checkbox "Fisiología del Ejercicio" [ref=e73]
              - text: Fisiología del Ejercicio
            - generic [ref=e74] [cursor=pointer]:
              - checkbox "Fisiología Humana" [ref=e75]
              - text: Fisiología Humana
            - generic [ref=e76] [cursor=pointer]:
              - checkbox "Gestión de Calidad" [ref=e77]
              - text: Gestión de Calidad
            - generic [ref=e78] [cursor=pointer]:
              - checkbox "Ingeniería de Software" [ref=e79]
              - text: Ingeniería de Software
            - generic [ref=e80] [cursor=pointer]:
              - checkbox "Inteligencia Artificial" [ref=e81]
              - text: Inteligencia Artificial
            - generic [ref=e82] [cursor=pointer]:
              - checkbox "Investigación de Operaciones" [ref=e83]
              - text: Investigación de Operaciones
            - generic [ref=e84] [cursor=pointer]:
              - checkbox "Macroeconomía" [ref=e85]
              - text: Macroeconomía
            - generic [ref=e86] [cursor=pointer]:
              - checkbox "Mecánica de Fluidos" [ref=e87]
              - text: Mecánica de Fluidos
            - generic [ref=e88] [cursor=pointer]:
              - checkbox "Mecánica de Sólidos" [ref=e89]
              - text: Mecánica de Sólidos
            - generic [ref=e90] [cursor=pointer]:
              - checkbox "Microeconomía" [ref=e91]
              - text: Microeconomía
            - generic [ref=e92] [cursor=pointer]:
              - checkbox "Neurociencias" [ref=e93]
              - text: Neurociencias
            - generic [ref=e94] [cursor=pointer]:
              - checkbox "Probabilidad y Estadística" [ref=e95]
              - text: Probabilidad y Estadística
            - generic [ref=e96] [cursor=pointer]:
              - checkbox "Programación I" [ref=e97]
              - text: Programación I
            - generic [ref=e98] [cursor=pointer]:
              - checkbox "Programación II" [ref=e99]
              - text: Programación II
            - generic [ref=e100] [cursor=pointer]:
              - checkbox "Psicología General" [ref=e101]
              - text: Psicología General
            - generic [ref=e102] [cursor=pointer]:
              - checkbox "Química General" [ref=e103]
              - text: Química General
            - generic [ref=e104] [cursor=pointer]:
              - checkbox "Redes de Computadores" [ref=e105]
              - text: Redes de Computadores
            - generic [ref=e106] [cursor=pointer]:
              - checkbox "Resistencia de Materiales" [ref=e107]
              - text: Resistencia de Materiales
            - generic [ref=e108] [cursor=pointer]:
              - checkbox "Señales y Sistemas" [ref=e109]
              - text: Señales y Sistemas
            - generic [ref=e110] [cursor=pointer]:
              - checkbox "Simulación de Sistemas" [ref=e111]
              - text: Simulación de Sistemas
            - generic [ref=e112] [cursor=pointer]:
              - checkbox "Termodinámica" [ref=e113]
              - text: Termodinámica
        - button "Crear Cuenta de Tutor" [ref=e114] [cursor=pointer]
      - paragraph [ref=e115]:
        - text: ¿Ya tienes perfil de tutor?
        - link "Inicia sesión" [ref=e116] [cursor=pointer]:
          - /url: /tutor/login
  - contentinfo [ref=e117]:
    - generic [ref=e118]:
      - generic [ref=e119]: TutoPool
      - paragraph [ref=e120]: © 2026 Universidad EIA · Todos los derechos reservados.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Registro estudiante', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/registro')
  6  |   })
  7  | 
  8  |   test('muestra todos los campos del formulario', async ({ page }) => {
  9  |     await expect(page.locator('input[name="nombre"], input[placeholder*="nombre" i], input[id*="nombre" i]').first()).toBeVisible()
  10 |     await expect(page.locator('input[type="email"]')).toBeVisible()
  11 |     await expect(page.locator('input[type="password"]')).toBeVisible()
  12 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  13 |   })
  14 | 
  15 |   test('muestra error con contraseña muy corta', async ({ page }) => {
  16 |     await page.locator('input[type="email"]').fill('nuevo@test.com')
  17 |     await page.locator('input[type="password"]').fill('123')
  18 |     await page.locator('button[type="submit"]').click()
  19 |     await expect(page.locator('text=/contraseña|password|mínimo|corta/i').first()).toBeVisible({ timeout: 6000 })
  20 |   })
  21 | 
  22 |   test('tiene enlace a login', async ({ page }) => {
  23 |     const link = page.locator('a[href*="login"], a:has-text("Inicia")')
  24 |     await expect(link.first()).toBeVisible()
  25 |   })
  26 | 
  27 |   test('muestra opciones de OAuth', async ({ page }) => {
  28 |     await expect(page.locator('button:has-text("Google"), a:has-text("Google")')).toBeVisible()
  29 |   })
  30 | })
  31 | 
  32 | test.describe('Registro tutor', () => {
  33 |   test.beforeEach(async ({ page }) => {
  34 |     await page.goto('/tutor/registro')
  35 |   })
  36 | 
  37 |   test('muestra campo de teléfono', async ({ page }) => {
> 38 |     await expect(page.locator('input[type="tel"], input[name*="telefono"], input[placeholder*="teléfono" i]').first()).toBeVisible()
     |                                                                                                                        ^ Error: expect(locator).toBeVisible() failed
  39 |   })
  40 | 
  41 |   test('muestra lista de materias para seleccionar', async ({ page }) => {
  42 |     await page.waitForTimeout(2000)
  43 |     const checkboxes = page.locator('input[type="checkbox"]')
  44 |     await expect(checkboxes.first()).toBeVisible({ timeout: 8000 })
  45 |   })
  46 | })
  47 | 
```