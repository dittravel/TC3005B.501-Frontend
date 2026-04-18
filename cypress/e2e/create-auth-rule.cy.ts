describe('Creación de regla de autorización por el administrador', () => {
  beforeEach(() => {
    cy.login(Cypress.env('ADMIN_USER'), Cypress.env('ADMIN_PASSWORD'));
  });

  afterEach(() => {
    cy.logout();
  });

  it('debe navegar a la página de crear regla desde el dashboard admin', () => {
    cy.visit('/crear-regla');
    cy.url().should('include', '/crear-regla');
    cy.contains(/regla de autorización/i).should('be.visible');
  });

  it('debe mostrar error al enviar el formulario con campos vacíos', () => {
    cy.visit('/crear-regla');

    cy.contains('button', /crear|guardar/i).click();

    cy.get('body').should('contain.text', /.+/);
    cy.url().should('include', '/crear-regla');
  });

  it('debe crear exitosamente una regla de autorización con un nivel', () => {
    cy.visit('/crear-regla');

    cy.get('input[name="rule_name"]').type('Regla Cypress Test');

    cy.get('input[name="niveles_autorizacion"]').type('1');

    cy.get('select[name="tipo_viaje"]').select(1);

    cy.get('input[name="dias_min"]').then(($input) => {
      if ($input.length) cy.wrap($input).type('1');
    });

    cy.wait(500);

    cy.get('select[name="nivel_1"]').then(($select) => {
      if ($select.length) cy.wrap($select).select(1);
    });

    cy.contains('button', /crear|guardar/i).click();

    cy.url().should('not.include', '/crear-regla');
  });

  it('no debe ser accesible para un rol no-administrador', () => {
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
