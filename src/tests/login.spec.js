import { test, expect } from '@playwright/test';

test('login exitoso', async ({ page, context }) => {

  await page.goto('https://localhost:4321/login');

  // Interceptar request
  await page.route('**/user/login', async (route, request) => {

    const postData = request.postDataJSON();

    expect(postData).toHaveProperty('username');
    expect(postData).toHaveProperty('password');

    expect(postData.username).not.toBe('');
    expect(postData.password).not.toBe('');

    await route.continue();
  });

  // Credenciales reales
  await page.fill('input[name="username"]', 'admin');

  await page.fill('input[name="password"]', '123');

  // Esperar response del login
  const responsePromise = page.waitForResponse(
    response =>
      response.url().includes('/user/login')
  );

  // Submit
  await page.click('button[type="submit"]');

  // Obtener response
  const response = await responsePromise;

  // Validar status exitoso
  expect(response.status()).toBe(200);

  // Validar cookie token
  const cookies = await context.cookies();

  const tokenCookie = cookies.find(
    cookie => cookie.name === 'token'
  );

  expect(tokenCookie).toBeTruthy();

  // Validar redirect
  await page.waitForURL('**/dashboard');

  expect(page.url()).toContain('/dashboard');
});