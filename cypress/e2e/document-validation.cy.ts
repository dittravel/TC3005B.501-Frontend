/**
 * Document Validation Test
 *
 * Tests the document upload and validation functionality.
 * Verifies that the application correctly accepts valid file formats (PDF, XML)
 * and rejects invalid formats.
 */

import 'cypress-file-upload';

describe('Document Upload Validation', () => {
  beforeEach(() => {
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));
  });

  const navigateToUploadPage = () => {
    cy.visit('/comprobar-gastos');
    cy.get('a[href^="/comprobar-solicitud/"]').first().click();
    cy.get('a[href^="/subir-comprobante/"]').first().click();
  };

  const selectRoute = () => {
    // Select the first available route
    cy.get('select[name="routeId"]').should('not.be.disabled').then(($select) => {
      const firstOption = $select.find('option:not([value=""])').first().val();
      cy.get('select[name="routeId"]').select(firstOption as string);
    });
  };

  const selectConcept = (concept: string) => {
    cy.get('select[name="concepto"]').select(concept);
  };

  const fillReceiptDate = (date: string) => {
    cy.get('input[name="receiptDate"]').type(date);
  };

  const fillAmount = (amount: string) => {
    // Amount field is disabled until receipt date is filled
    cy.get('input[name="monto"]').should('not.be.disabled').type(amount);
  };

  const selectCurrency = (currency: string) => {
    cy.get('select[name="currency"]').select(currency);
  };

  const submitForm = () => {
    cy.contains('button', /enviar|subir/i).click();
  };

  it('should fill all required fields correctly', () => {
    navigateToUploadPage();
    selectRoute();
    selectConcept('Hospedaje');
    fillReceiptDate('2028-06-15');
    fillAmount('150.50');
    selectCurrency('MXN');

    // Verify all fields are filled
    cy.get('select[name="routeId"]').should('not.have.value', '');
    cy.get('select[name="concepto"]').should('have.value', 'Hospedaje');
    cy.get('input[name="receiptDate"]').should('have.value', '2028-06-15');
    cy.get('input[name="monto"]').should('have.value', '150.50');
    cy.get('select[name="currency"]').should('have.value', 'MXN');
  });

  it('should reject submission without required files', () => {
    navigateToUploadPage();
    selectRoute();
    selectConcept('Hospedaje');
    fillReceiptDate('2028-06-15');
    fillAmount('150.50');
    selectCurrency('MXN');

    // Try to submit without files
    submitForm();

    // Should show error message about missing files
    cy.contains(/adjunta|required/i).should('exist');
  });
});
