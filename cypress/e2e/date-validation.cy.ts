/**
 * Request Date Validation Test
 *
 * This test suite validates the date fields in the travel request creation process.
 * It checks for:
 * - Missing dates
 * - Return date being before departure date
 * - Successful creation with valid dates
 *
 * The tests are designed to ensure that the application correctly handles date validation
 * and provides appropriate feedback to the user.
 */

describe('Travel Request Date Validation', () => {
  beforeEach(() => {
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));
    cy.visit('/crear-solicitud');
  });

  afterEach(() => {
    cy.logout();
  });

  const fillFormWithoutDates = () => {
    // Select origin country and city
    cy.get('select[name="origin_country_name"]').select('México');
    cy.get('select[name="origin_city_name"]').select('CDMX');

    // Select destination country and city
    cy.get('select[name="destination_country_name"]').select('Estados Unidos');
    cy.get('select[name="destination_city_name"]').select('Nueva York');

    // Select hotel checkbox
    cy.contains('label', '¿Requiere Hotel?').click();

    // Enable advance payment
    cy.contains('label', '¿Requiere Anticipo?').click();
    cy.get('input[name="requested_fee"]').type('2000');

    // Add notes
    cy.get('textarea[name="notes"]').type('Test notes');
  };

  const fillDates = (startDate: string, startTime: string, endDate: string, endTime: string) => {
    cy.get('input[name="beginning_date"]').clear().type(startDate);
    cy.get('input[name="beginning_time"]').clear().type(startTime);
    cy.get('input[name="ending_date"]').clear().type(endDate);
    cy.get('input[name="ending_time"]').clear().type(endTime);
  };

  const submitForm = () => {
    cy.contains('button', /enviar/i).click();
  };

  it('should show error when dates are missing', () => {
    fillFormWithoutDates();
    submitForm();
    cy.contains('Ruta #1: Las fechas de inicio y fin son obligatorias.').should('be.visible');
  });

  it('should show error when end date is before start date', () => {
    fillFormWithoutDates();
    fillDates('2028-12-12', '09:00', '2028-11-11', '21:00');
    submitForm();
    cy.contains('Ruta #1: La fecha de fin').should('be.visible');
    cy.contains('debe ser igual o posterior a la fecha de inicio').should('be.visible');
  });

  it('should successfully create request with valid future dates', () => {
    fillFormWithoutDates();
    fillDates('2028-11-11', '09:00', '2028-12-12', '21:00');
    submitForm();
    cy.url().should('include', '/solicitudes');
  });
});
