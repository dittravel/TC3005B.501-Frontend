/**
 * Create Auth Rule test
 * 
 * This tests creates a new authorization rule with 3 levels, 
 * using a mix of direct boss, random authorizer, and superior level.
 * It also verifies that the rule is created successfully and appears in the list.
 */

describe('Create auth rule', () => {
  beforeEach(() => {
    cy.login(Cypress.env('ADMIN_USER'), Cypress.env('ADMIN_PASSWORD'));
  });

  afterEach(() => {
    cy.logout();
  });

  it('debe crear una regla de autorización con parámetros personalizados', () => {
    cy.visit('/crear-regla');

    // Basic rule data
    const ruleName = `Regla ${new Date().getTime()}`;
    cy.get('input[name="rule_name"]').type(ruleName);

    // Configure 3 levels
    cy.get('input[name="num_levels"]').clear().type('3');

    // Unselect automatic to choose manual authorizers
    cy.contains('label', 'Automático').click();

    // Wait for level selects to appear
    cy.get('select[name="nivel_1"]').should('exist');
    cy.get('select[name="nivel_2"]').should('exist');

    // Level 1: Direct boss
    cy.get('select[name="nivel_1"]').select('Jefe');

    // Level 2: Random authorizer
    cy.get('select[name="nivel_2"]').select('Aleatorio');

    // Level 3: Superior level, select level 2 as superior
    cy.get('select[name="nivel_3"]').select('Nivel_Superior');
    cy.get('select[name="usuario_3"]').select('2');

    // International travel type
    cy.get('select[name="travel_type"]').select('Internacional');

    // Duration range
    cy.get('input[name="min_duration"]').clear().type('3');
    cy.get('input[name="max_duration"]').clear().type('15');

    // Amount range
    cy.get('input[name="min_amount"]').clear().type('5000');
    cy.get('input[name="max_amount"]').clear().type('50000');


    cy.contains('button', /guardar|actualizar/i).click();
    cy.url().should('include', '/reglas-autorizacion');
    cy.contains(ruleName).should('be.visible');
  });

  it('Check that rules cannot be accessed by non-admin users', () => {
    cy.logout();
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));

    cy.request({
      url: '/crear-regla',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
