// Extensión del namespace de Cypress para declarar el comando personalizado 'login'
declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): Chainable<void>;
  }
}

// Extensión del namespace de Cypress para declarar el comando personalizado 'logout'
declare namespace Cypress {
  interface Chainable {
    logout(): Chainable<void>;
  }
}

/**
 * Comando personalizado para iniciar sesión en la aplicación.
 * Visita la URL base, limpia cookies y localStorage, completa el formulario
 * de login y verifica que la redirección al dashboard sea exitosa.
 *
 * @param username - Nombre de usuario para autenticarse
 * @param password - Contraseña del usuario
 */
Cypress.Commands.add('login', (username: string, password: string) => {
  // Navega a la página principal de la aplicación
  cy.visit('https://localhost:4321');

  // Limpia cookies y almacenamiento local para evitar sesiones residuales
  cy.clearCookies();
  cy.clearLocalStorage();

  // Ingresa el nombre de usuario en el campo correspondiente
  cy.get('input[placeholder*="Usuario"]').type(username);

  // Ingresa la contraseña y envía el formulario con Enter
  cy.get('input[placeholder*="Contraseña"]').type(password + '{enter}');

  // Verifica que la alerta de éxito contenga el mensaje esperado
  cy.on('window:alert', (text) => {
    expect(text).to.contains('Inicio de sesión exitoso');
  });

  // Acepta automáticamente cualquier diálogo de confirmación del navegador
  cy.on('window:confirm', () => true);

  // Confirma que la URL incluye 'dashboard' tras el login exitoso
  cy.url().should('include', 'dashboard');
});

/**
 * Comando personalizado para cerrar sesión en la aplicación.
 * Espera un momento, hace clic en el ícono de logout y confirma
 * el cierre de sesión, verificando la redirección a la página de login.
 */
Cypress.Commands.add('logout', () => {
  // Espera 1 segundo para asegurar que la UI esté completamente cargada
  cy.wait(1000);

  // Hace clic en el ícono de logout del menú
  cy.get('span.material-symbols-outlined').contains('logout').click();

  // Confirma el cierre de sesión en el diálogo de confirmación
  cy.contains('button', 'Cerrar Sesión').should('be.visible').click();

  // Verifica que el usuario fue redirigido a la página de login
  cy.url().should('include', '/login');
});