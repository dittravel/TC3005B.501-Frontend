/**
 * Draft Request Test
 *
 * This test verifies that an applicant can
 * save, edit, and delete draft travel requests.
 */

describe('Gestión de borradores de solicitudes de viaje', () =>{
  beforeEach(() => {
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));
  });

  it('debe permitir guardar un nuevo borrador con datos de destino', () => {
    cy.visit('/crear-solicitud');

    // Select origin country and city
    cy.get('select[name="origin_country_name"]').select('México');
    cy.get('select[name="origin_city_name"]').select('CDMX');

    // Select destination country and city
    cy.get('select[name="destination_country_name"]').select('Estados Unidos');
    cy.get('select[name="destination_city_name"]').select('Nueva York');

    // Save as draft
    cy.contains('button', /guardar.*borrador/i).click();
    cy.contains(/guardado|éxito/i).should('exist');
  });

  it('debe permitir editar un borrador existente', () => {
    cy.visit('/solicitudes');

    // Filter by draft status
    cy.get('select[name="filter-status"]').select('Borrador');

    // Find draft with Nueva York and click edit button
    cy.contains('Nueva York').first().parent().parent().parent().parent().find('button').contains(/editar/i).click();

    // Edit destination city
    cy.get('select[name="destination_city_name"]').select('Los Angeles');

    // Save changes
    cy.contains('button', /guardar/i).click();
    cy.contains(/guardado|éxito/i).should('exist');
  });

  it('debe permitir eliminar un borrador existente', () => {
    cy.visit('/solicitudes');

    // Filter by draft status
    cy.get('select[name="filter-status"]').select('Borrador');

    // Find draft and delete
    cy.contains('Nueva York').first().parent().parent().parent().parent().find('[class*="material-symbols"]').first().click({ force: true });

    // Confirm deletion
    cy.contains('button', /confirmar/i).click();
  });

})
