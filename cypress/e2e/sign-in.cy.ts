describe('sign-in page', () => {
    it('shoud render sign-in page', () => {
        cy.setCookie('CookieConsent', 'true', {
            domain: 'localhost',
            path: '/',
            hostOnly: true,
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
        });
        cy.visit('/');
        cy.get('main').should('have.length', 1);
    });

    it('shoud display the page title', () => {
        cy.setCookie('CookieConsent', 'true', {
            domain: 'localhost',
            path: '/',
            hostOnly: true,
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
        });
        cy.visit('/');
        cy.get('main h1').should('have.length', 1);
        cy.get('main h1').contains('Prihlasovacia obrazovka');
    });

    it('shoud display the inputs', () => {
        cy.setCookie('CookieConsent', 'true', {
            domain: 'localhost',
            path: '/',
            hostOnly: true,
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
        });
        cy.visit('/');
        cy.get('main input[type="text"]').should('have.length', 1);
        cy.get('main input[name="username"]').should('have.length', 1);
        cy.get('main input[type="password"]').should('have.length', 1);
        cy.get('main input[name="password"]').should('have.length', 1);
        cy.get('main input[type="checkbox"]').should('have.length', 1);
        cy.get('main input[name="rememberMe"]').should('have.length', 1);
    });

    it('shoud display the link and buttons', () => {
        cy.setCookie('CookieConsent', 'true', {
            domain: 'localhost',
            path: '/',
            hostOnly: true,
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
        });
        cy.visit('/');
        cy.get('main a').contains('Zabudol si heslo?');
        cy.get('main button.btn-primary').contains('Prihlásiť sa');
        cy.get('main button.btn-secondary').contains('Cookies');
    });
});
