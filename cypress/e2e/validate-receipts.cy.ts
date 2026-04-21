describe('Validación de comprobantes por Cuentas por Pagar', () => {
  beforeEach(() => {
    cy.login(Cypress.env('CPP_USER'), Cypress.env('CPP_PASSWORD'));
  });

  afterEach(() => {
    cy.logout();
  });

  it('debe mostrar solicitudes en estado COMPROBACIÓN en el dashboard', () => {
    cy.contains(/comprobación/i).should('exist');
  });

  it('debe navegar al detalle de una solicitud en estado COMPROBACIÓN', () => {
    cy.contains('a[href^="/detalles-solicitud/"]', /comprobación/i)
      .first()
      .click();

    cy.url().should('include', '/detalles-solicitud/');
    cy.contains(/comprobación/i).should('be.visible');
  });

  it('debe poder acceder a la vista de comprobación de gastos', () => {
    cy.contains('a[href^="/detalles-solicitud/"]', /comprobación/i)
      .parents('div')
      .first()
      .within(() => {
        cy.contains(/^#\d+$/).then(($id) => {
          const idText = $id.text().replace('#', '').trim();
          cy.visit(`/comprobar-gastos/${idText}`);
        });
      });

    cy.url().should('include', '/comprobar-gastos/');
  });

  it('no debe ser accesible para el rol Solicitante', () => {
    cy.logout();
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));

    cy.request({
      url: '/comprobar-gastos/1',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
