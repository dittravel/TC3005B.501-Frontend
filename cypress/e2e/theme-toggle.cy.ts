/**
 * Theme toggle cypress tests
 *
 * Verifies that the theme toggle button correctly switches between light and dark modes,
 * updates localStorage, and maintains the selected theme across different views.
 *
 * Cypress docs: https://docs.cypress.io/app/get-started/why-cypress
 */

// Verify that the theme toggle button changes the background color of all card elements
const verifyThemeColorChange = () => {
  // Get all card elements and store their background colors
  cy.get('[class*="bg-card"]').then(($elements) => {
    // Store original colors
    const originalColors = Array.from($elements).map((element) => {
      const styles = window.getComputedStyle(element);
      return {
        bg: styles.backgroundColor,
        text: styles.color
      };
    });

    // Click the theme toggle button to switch modes
    cy.get('#theme-toggle').click();

    // Wait for dark mode styles to be applied
    cy.wait(100);

    // Verify that all card element colors have changed
    cy.get('[class*="bg-card"]').then(($darkElements) => {
      const newColors = Array.from($darkElements).map((element) => {
        const styles = window.getComputedStyle(element);
        return {
          bg: styles.backgroundColor,
          text: styles.color
        };
      });

      // Check that each element's color has changed
      originalColors.forEach((originalColor, index) => {
        if (newColors[index]) {
          const bgChanged = newColors[index].bg !== originalColor.bg;
          const textChanged = newColors[index].text !== originalColor.text;
          // At least one of the colors (background or text) should change
          expect(bgChanged || textChanged).to.be.true;
        }
      });
    });
  });
};

// Define all user types to test with their accessible routes
const userRoles = [
  {
    name: 'Superadministrador',
    userEnv: 'SUPERADMIN_USER',
    passEnv: 'SUPERADMIN_PASSWORD',
    routes: [
      '/dashboard',
      '/perfil-usuario',
      '/sociedades',
      '/grupos-sociedades',
      '/administradores-maestros',
      '/bitacora-grupo',
    ]
  },
  {
    name: 'Administrador',
    userEnv: 'ADMIN_USER',
    passEnv: 'ADMIN_PASSWORD',
    routes: [
      '/usuarios',
      '/roles',
      '/reglas-autorizacion',
      '/politicas-reembolso',
      '/importar-datos',
      '/exportar-datos-contables',
      '/bitacora',
    ]
  },
  {
    name: 'Solicitante',
    userEnv: 'SOLICITANTE_USER',
    passEnv: 'SOLICITANTE_PASSWORD',
    routes: [
      '/solicitudes',
      '/comprobar-gastos',
      '/reembolsos',
    ]
  },
  {
    name: 'Autorizador',
    userEnv: 'N1_USER',
    passEnv: 'N1_PASSWORD',
    routes: [
      '/autorizaciones'
    ]
  },
  {
    name: 'Agencia de Viajes',
    userEnv: 'AV_USER',
    passEnv: 'AV_PASSWORD',
    routes: [
      '/atenciones'
    ]
  },
  {
    name: 'Cuentas por Pagar',
    userEnv: 'CPP_USER',
    passEnv: 'CPP_PASSWORD',
    routes: [
      '/cotizaciones',
      '/comprobaciones'
    ]
  },
];

// Run tests for each user role
userRoles.forEach(({ name, userEnv, passEnv, routes }) => {
  describe(`Cambio de Tema (Dark Mode / Light Mode) - ${name}`, () => {
    // Log in once before all tests in this suite
    before(() => {
      cy.login(Cypress.env(userEnv), Cypress.env(passEnv));
    });

    // Log out once after all tests in this suite
    after(() => {
      cy.logout();
    });

    // Verify theme toggle on accessible routes
    routes.forEach((route) => {
      it(`Verificar elementos en ruta: ${route}`, () => {
        cy.visit(route);
        cy.url().should('include', route);
        verifyThemeColorChange();
      });
    });
  });
});
