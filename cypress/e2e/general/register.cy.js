const registerAccount = (username, email, password) => {
  cy.clearCookies()

  /* Interact with login page  */
  cy.visit('http://localhost:3000/');
  cy.get('[data-cy="login-register"]').click();

  /* Interact with register page  */
  cy.get('[data-cy="register-username"]').click()
    .type(username).should('have.value', username);
  cy.get('[data-cy="register-email"]').click()
    .type(email).should('have.value', email);
  cy.get('[data-cy="register-password"]').click()
    .type(password).should('have.value', password);
  cy.get('[data-cy="register"]').click();

  /* Interact with login page  */
  cy.get('[data-cy="login-email"]').click()
    .type(email).should('have.value', email);
  cy.get('[data-cy="login-password"]').click()
    .type(password).should('have.value', password);
  cy.get('[data-cy="login"]').click();

  /* Check that main swipe-profile view is visible  */
  cy.get('.swipe-profile', { timeout: 1000 }).should('exist');
}

describe('register spec', () => {
  it('passes', () => {
    cy.fixture('my-users').then((usersFixture) => {
      usersFixture.forEach((user) => {
        registerAccount(user.username, user.email, user.password);
      });
    })
  })
})