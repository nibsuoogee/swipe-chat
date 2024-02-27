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

describe('mutual like to match spec', () => {
  it('passes', () => {
    cy.fixture('my-users').then((usersFixture) => {
      expect(usersFixture).to.have.lengthOf(2);

      /* Login first user */
      login(usersFixture[0].email, usersFixture[0].password);

      /* Like first swipe card */
      cy.get('[data-cy="like-profile"]').click();
      cy.get('[data-cy="no-more-profiles"]').should('be.visible');

      /* Logout first user */
      cy.get('[data-cy="nav-logout"]').eq(0).should('be.visible').then(($element) => {
        if ($element.length > 0) {
          cy.wrap($element).click();
        } else {
          cy.get('[data-cy="nav-logout"]').eq(1).should('be.visible').click();
        }
      });

      /* Login second user */
      login(usersFixture[1].email, usersFixture[1].password);

      /* Like first swipe card */
      cy.get('[data-cy="like-profile"]').click();

      /* Start chatting with match */
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
      cy.get('[data-cy="chat-input"]').click()
        .type(`${usersFixture[1].username} wrote this`).should('have.value', `${usersFixture[1].username} wrote this`);
      cy.get('[data-cy="chat-send"]').click();
    })




  })
})
