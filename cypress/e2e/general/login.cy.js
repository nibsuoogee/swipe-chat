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
  cy.get('.swipe-profile', { timeout: 1000 }).should('exist');
}

describe('login spec', () => {
  it('passes', () => {
    cy.fixture('my-users').then((usersFixture) => {
      usersFixture.forEach((user) => {
        login(user.email, user.password);
      });
    })
  })
})