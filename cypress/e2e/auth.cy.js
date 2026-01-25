describe('Auth UI Flow', () => {
  const user = {
    name: 'Cypress Test',
    email: 'cypress@test.com',
    password: 'test123',
  };

  const loginViaUi = () => {
    cy.viewport(1280, 720);
    cy.intercept('GET', '/api/v1/auth/me').as('getMe');
    cy.visit('/login');

    cy.get('input[placeholder="Email"]').clear().type(user.email);
    cy.get('input[placeholder="Password"]').clear().type(user.password);
    cy.contains('button', 'Login').click();

    cy.wait('@getMe', { timeout: 15000 }).then(({ response }) => {
      expect([200, 304]).to.include(response.statusCode);
    });
    cy.window().its('localStorage').should((storage) => {
      expect(storage.getItem('token')).to.be.a('string');
    });
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('logs in through the UI and keeps user data in sync', () => {
    loginViaUi();

    cy.window().then((win) => {
      const storedUser = win.localStorage.getItem('user');
      expect(storedUser).to.be.a('string');
      const parsedUser = JSON.parse(storedUser);
      expect(parsedUser.email).to.eq(user.email);
    });

    cy.get('button[aria-label="Open menu"]').click();
    cy.contains('button', 'Logout').should('be.visible');
  });

  it('logs out through the UI and removes the session', () => {
    loginViaUi();

    cy.get('button[aria-label="Open menu"]').click();
    cy.contains('button', 'Logout').should('be.visible').click({ force: true });

    cy.getCookie('token').should('not.exist');
    cy.window().its('localStorage').invoke('getItem', 'token').should('not.exist');
    cy.location('pathname').should('include', '/login');
  });
});