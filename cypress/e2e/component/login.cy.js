const testLoginPost = (email, password) => {
  cy.clearCookies()

  cy.visit('http://localhost:3000/');

  cy.get('[data-cy="login-view"]').should('exist')

  /* Interact with login page  */
  cy.get('[data-cy="login-email"]').click()
    .type(email).should('have.value', email);
  cy.get('[data-cy="login-password"]').click()
    .type(password).should('have.value', password);

  /* Mock POST /user/login and stub response */
  cy.intercept({
    method: 'POST',
    url: '**/user/login',
  }, {
    statusCode: 200,
    body: '<p data-cy="login-response-stub">Response stub</p>',
    headers: { 'access-control-allow-origin': '*' },
    delayMs: 500,
  }).as('postLogin')
  cy.get('[data-cy="login"]').click();
  cy.wait('@postLogin').should(({ request, response }) => {
    expect(request.body).to.include('email')
    expect(request.body).to.include('password')
  })

  /* Assert existance of injected response stub html... */
  cy.get('[data-cy="login-response-stub"]').should('have.text', 'Response stub');
  /* ... in place of the login view */
  cy.get('[data-cy="login-view"]').should('not.exist');
}

describe('login spec', () => {
  it('passes', () => {
    cy.fixture('my-users').then((usersFixture) => {
      testLoginPost(usersFixture[0].email, usersFixture[0].password);

    })
  })
})