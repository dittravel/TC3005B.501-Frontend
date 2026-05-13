/**
 * General command definitions for Cypress tests
 * 
 * This file contains custom commands that can be reused across multiple test files, 
 * such as login and logout functions.
 */

// Cypress namespace extension to declare the custom 'login' command
declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): Chainable<void>;
  }
}

// Cypress namespace extension to declare the custom 'logout' command
declare namespace Cypress {
  interface Chainable {
    logout(): Chainable<void>;
  }
}

/**
 * Custom command to perform user login in the application.
 * It navigates to the main page, fills in the username and password,
 * @param {string} username - Username of the user to log in
 * @param {string} password - Password of the user to log in
 * @returns {void} 
 */
Cypress.Commands.add('login', (username: string, password: string) => {
  // Navigate to the login page
  cy.visit('https://localhost:4321/login');

  // Clear cookies and local storage only on first login
  cy.clearCookies();
  cy.clearLocalStorage();

  // Enter the username
  cy.get('input[name="username"]').type(username);

  // Enter the password
  cy.get('input[name="password"]').type(password);

  // Submit the form
  cy.contains('button', 'Ingresar').click();

  // Confirm successful login - wait for dashboard redirect
  cy.url().should('include', '/dashboard');
});

/**
 * Custom command to perform user logout from the application.
 * It clicks on the user menu to reveal the logout option, then clicks on 'Cerrar Sesión',
 * and finally verifies that the URL includes '/login' to confirm successful logout.
 * @returns {void} 
 */
Cypress.Commands.add('logout', () => {
  // Wait briefly to ensure any pending operations are completed
  cy.wait(500);

  // Click on the user menu button
  cy.get('button[title="Menú de usuario"]').click({ force: true });

  // Click on 'Cerrar Sesión' button in dropdown
  cy.contains('button', 'Cerrar Sesión').click({ force: true });

  // Confirm successful logout
  cy.url().should('include', '/login');
});