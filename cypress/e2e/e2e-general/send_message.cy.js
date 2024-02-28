const login = (email, password) => {
  cy.clearCookies()

  /* Interact with login page  */
  cy.visit('http://localhost:3000/');
  cy.get('[data-cy="login-email"]').click()
    .type(email).should('have.value', email);
  cy.get('[data-cy="login-password"]').click()
    .type(password).should('have.value', password);
  cy.get('[data-cy="login"]').click();

  /* Check that main swipe-profile view is visible  */
  cy.get('.swipe-profile', { timeout: 1000 }).should('be.visible');
}

const navigateToChat = () => {
  /* Start chatting with only match */
  cy.get('[data-cy="nav-messaging"]').eq(0).should('be.visible').then(($element) => {
    if ($element.length > 0) {
      cy.wrap($element).click();
    } else {
      cy.get('[data-cy="nav-messaging"]').eq(1).should('be.visible').click();
    }
  });
  cy.get('[data-cy="open-chat"]').eq(0).should('be.visible').then(($element) => {
    if ($element.length > 0) {
      cy.wrap($element).click();
    }
  });
}

const logout = () => {
  cy.get('[data-cy="nav-logout"]').eq(0).should('be.visible').then(($element) => {
    if ($element.length > 0) {
      cy.wrap($element).click();
    } else {
      cy.get('[data-cy="nav-logout"]').eq(1).should('be.visible').click();
    }
  });
}

describe('mutual like to match spec', () => {
  it('passes', () => {
    cy.fixture('my-users').then((usersFixture) => {
      expect(usersFixture).to.have.lengthOf(2);

      /* Login first user */
      login(usersFixture[0].email, usersFixture[0].password);

      navigateToChat();

      /* Send message */
      cy.get('[data-cy="chat-input"]').click()
        .type(`${usersFixture[0].username} wrote this`).should('have.value', `${usersFixture[0].username} wrote this`);
      cy.get('[data-cy="chat-send"]').click();

      logout();

      /* Login second user */
      login(usersFixture[1].email, usersFixture[1].password);

      navigateToChat();

      /* Read chat */
      cy.get('[data-cy="message-text"]').should('exist');
      cy.get('[data-cy="message-text"]').should('have.text', `${usersFixture[0].username} wrote this`);
    })
  })
})
