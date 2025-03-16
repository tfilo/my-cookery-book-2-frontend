describe('cookies-consent', () => {
    it('shoud be visible', () => {
        cy.visit('/');
        cy.get('div.bg-primary').should('have.length', 1);
        cy.get('div.bg-primary').should('be.visible');
        cy.get('div.bg-primary h2').contains('Cookies');
        cy.get('div.bg-primary p').should('have.length', 3);
        cy.get('div.bg-primary #rcc-confirm-button').should('have.length', 1);
        cy.get('div.bg-primary #rcc-decline-button').should('have.length', 1);
        cy.get('div.bg-primary a')
            .should('have.prop', 'href')
            .should('eq', Cypress.config().baseUrl + '/consent');
    });

    it('shoud accept cookies', () => {
        cy.visit('/');
        cy.get('div.bg-primary #rcc-confirm-button').click();
    });
});
