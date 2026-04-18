describe('Rechazo de una solicitud por el autorizador', () => {
  function buscarSolicitud(id: string) {
    cy.document().then((doc) => {
      const links = [...doc.querySelectorAll('a[href^="/autorizar-solicitud/"]')];
      const link = links.find((a) => (a as HTMLAnchorElement).href?.includes(id));
      if (link) {
        cy.wrap(link).click();
        cy.contains('button', 'Rechazar').click();
        cy.contains('button', 'Confirmar').should('be.visible').click();
      } else {
        cy.wait(2000);
        avanzarPagina(id);
      }
    });
  }

  function avanzarPagina(id: string) {
    cy.get('div.flex.justify-center.items-center.gap-2.mt-8 > button')
      .filter((_, el) => /^\d+$/.test(el.textContent || ''))
      .then(($pageButtons) => {
        const currentBtn = $pageButtons.filter((_, el) =>
          el.classList.contains('bg-primary-500') && el.classList.contains('text-white')
        );
        const currentIndex = $pageButtons.index(currentBtn);
        const nextPageBtn = $pageButtons.get(currentIndex + 1);

        if (nextPageBtn) {
          cy.wrap(nextPageBtn).click();
          buscarSolicitud(id);
        } else {
          cy.get('div.flex.justify-center.items-center.gap-2.mt-8 > button')
            .contains('»')
            .then(($nextBtn) => {
              if (!$nextBtn.prop('disabled')) {
                cy.wrap($nextBtn).click();
                cy.wait(500);
                buscarSolicitud(id);
              } else {
                throw new Error(`❌ No se encontró la solicitud con ID: ${id}`);
              }
            });
        }
      });
  }

  afterEach(() => {
    cy.logout();
  });

  it('debe obtener el ID de una solicitud en estado PRIMERA REVISIÓN desde el perfil del solicitante', () => {
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));

    cy.contains('a[href^="/detalles-solicitud/"]', 'PRIMERA REVISIÓN')
      .parents('div')
      .first()
      .within(() => {
        cy.contains(/^#\d+$/).then(($id) => {
          const idText = $id.text().replace('#', '').trim();
          Cypress.env('reject_request_id', idText);
        });
      });
  });

  it('debe rechazar la solicitud y cambiar su estado a RECHAZADA', () => {
    cy.login(Cypress.env('N2_USER'), Cypress.env('N2_PASSWORD'));

    cy.get('li').contains('AUTORIZACIONES').click();
    buscarSolicitud(Cypress.env('reject_request_id'));
  });

  it('debe mostrar que la solicitud fue cambiada a estado RECHAZADA desde el perfil del solicitante', () => {
    cy.login(Cypress.env('SOLICITANTE_USER'), Cypress.env('SOLICITANTE_PASSWORD'));

    cy.contains(Cypress.env('reject_request_id'))
      .parents('div')
      .first()
      .should('contain.text', 'RECHAZADA');
  });
});
