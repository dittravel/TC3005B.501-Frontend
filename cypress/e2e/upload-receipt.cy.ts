describe('Subida de comprobante de gasto por el solicitante', () => {
  beforeEach(() => {
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));
  });

  afterEach(() => {
    cy.logout();
  });

  it('debe navegar a subir-comprobante desde una solicitud en estado COMPROBACIÓN', () => {
    cy.contains('a[href^="/detalles-solicitud/"]', 'COMPROBACIÓN')
      .parents('div')
      .first()
      .within(() => {
        cy.contains(/^#\d+$/).then(($id) => {
          const idText = $id.text().replace('#', '').trim();
          cy.visit(`/subir-comprobante/${idText}`);
        });
      });

    cy.url().should('include', '/subir-comprobante/');
  });

  it('debe mostrar error al intentar enviar el formulario de comprobante vacío', () => {
    cy.contains('a[href^="/detalles-solicitud/"]', 'COMPROBACIÓN')
      .parents('div')
      .first()
      .within(() => {
        cy.contains(/^#\d+$/).then(($id) => {
          const idText = $id.text().replace('#', '').trim();
          cy.visit(`/subir-comprobante/${idText}`);
        });
      });

    cy.contains('button', /guardar|enviar|agregar/i).click();
    cy.contains(/requerido|obligatorio|selecciona|required/i).should('be.visible');
  });

  it('debe completar y enviar exitosamente un comprobante de gasto', () => {
    cy.contains('a[href^="/detalles-solicitud/"]', 'COMPROBACIÓN')
      .parents('div')
      .first()
      .within(() => {
        cy.contains(/^#\d+$/).then(($id) => {
          const idText = $id.text().replace('#', '').trim();
          cy.visit(`/subir-comprobante/${idText}`);
        });
      });

    cy.get('select[name="routeId"], [name="routeId"]').select(1);
    cy.get('input[name="concepto"], [label="Concepto"] input').type('Taxi al aeropuerto');
    cy.get('input[name="monto"], [label="Monto"] input').type('350');
    cy.get('select[name="currency"], [name="currency"]').select(1);

    cy.contains('button', /guardar|agregar comprobante/i).click();

    cy.url().should('not.include', '/subir-comprobante/');
  });
});
