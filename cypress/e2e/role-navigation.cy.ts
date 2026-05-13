describe('Validación de acceso a rutas restringidas', () => {
  describe('usuarios authenticated', () => {
    beforeEach(() => {
      cy.login(Cypress.env('CPP_USER'), Cypress.env('CPP_PASSWORD'));
    });

    it('debe denegar el acceso a la ruta /crear-solicitud mostrando error 404', () => {
      cy.request({
        url: '/crear-solicitud',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('users without authentication', () => {
    it('debe redirigir al login si se intenta acceder a /crear-solicitud', () => {
      cy.visit('/crear-solicitud', { failOnStatusCode: false });
      cy.url().should('include', '/login');
    });
  });
});
