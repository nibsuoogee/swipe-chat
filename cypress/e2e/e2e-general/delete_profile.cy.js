const deleteProfile = (email, password) => {
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

  /* Navigate to profile view */
  cy.get('[data-cy="nav-profile"]').eq(0).should('be.visible').then(($element) => {
    if ($element.length > 0) {
      cy.wrap($element).click();
    } else {
      cy.get('[data-cy="nav-profile"]').eq(1).should('be.visible').click();
    }
  });
  cy.get('[data-cy="profile-view"]', { timeout: 1000 }).should('exist');

  /* Delete profile */
  cy.get('[data-cy="delete-profile"]').click();

  cy.get('[data-cy="login-view"]', { timeout: 1000 }).should('exist');
}

describe('delete profile spec', () => {
  it('passes', () => {
    cy.fixture('two-users').then((usersFixture) => {
      usersFixture.forEach((user) => {
        deleteProfile(user.email, user.password);
      });
    })
  })
})