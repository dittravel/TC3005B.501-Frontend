/**
 * Create Request Test
 * 
 * This test verifies that an applicant can
 * successfully create a travel request.
 */

describe('Create travel request', () =>{
  beforeEach(() => {
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));
  });

  afterEach(() => {
    cy.logout();
  });

  it('Crear request', () => {
    cy.visit('/crear-solicitud');

    // Select origin country and city
    cy.get('select[name="origin_country_name"]').select('México');
    cy.get('select[name="origin_city_name"]').select('CDMX');

    // Select destination country and city
    cy.get('select[name="destination_country_name"]').select('Estados Unidos');
    cy.get('select[name="destination_city_name"]').select('Nueva York');

    // Set dates and times
    cy.get('input[name="beginning_date"]').type('2028-10-12');
    cy.get('input[name="beginning_time"]').type('10:23');
    cy.get('input[name="ending_date"]').type('2028-10-20');
    cy.get('input[name="ending_time"]').type('23:00');

    // Select additional services
    cy.contains('label', '¿Requiere Avión?').click();
    cy.contains('label', '¿Requiere Hotel?').click();

    // Enable advance and set amount
    cy.contains('label', '¿Requiere Anticipo?').click();
    cy.get('input[name="requested_fee"]').type('1000');

    // Add notes
    cy.get('textarea[name="notes"]').type('Esta solicitud fue creada con una prueba Cypress :)');

    cy.contains('button', /enviar/i).click();
    cy.url().should('include', '/solicitudes');

    // Verify the new request appears in the list with correct details
    cy.contains('Nueva York, Estados Unidos').should('be.visible');
    cy.contains('$1000').should('be.visible');
  })

})