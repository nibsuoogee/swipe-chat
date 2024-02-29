const testLoginResponse = (email, password) => {
  cy.request('POST', 'http://localhost:3000/auth/login', {
    email: email,
    password: password
  })
    .its('body')
    .as('markup')
    .then(function () {
      expect(this.markup, 'markup contains authenticated main page view')
        .contains('data-cy="swipe-view"')
    })
}

describe('login spec', () => {
  it('passes', () => {
    cy.fixture('my-users').then((usersFixture) => {
      testLoginResponse(usersFixture[0].email, usersFixture[0].password);

    })
  })
})