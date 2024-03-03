const testLoginResponse = (email, password, stringsToMatch) => {
  cy.request('POST', 'http://localhost:3000/auth/login', {
    email: email,
    password: password
  })
    .its('body')
    .as('markup')
    .then(function () {
      stringsToMatch.forEach(string => {
        expect(this.markup)
          .contains(string)
      });
    })
}

describe('attempt login with good and bad inputs', () => {
  it('returns error on bad username/password', () => {
    cy.fixture('my-users').then((usersFixture) => {
      const stringsToMatch = [
        'data-cy="login-view"',
        'data-cy="login-error"',
        'Incorrect username or password.'
      ]
      testLoginResponse('this.email@does.not.exist',
        'nor does this password',
        stringsToMatch
      );
    })
  })

  it('returns main page view on correct username + password', () => {
    cy.fixture('my-users').then((usersFixture) => {
      const stringsToMatch = [
        'data-cy="swipe-view"'
      ]
      testLoginResponse(usersFixture[0].email,
        usersFixture[0].password,
        stringsToMatch
      );
    })
  })
})