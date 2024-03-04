import { login } from './login.js'

describe('login spec', () => {
  it('passes', () => {
    cy.fixture('two-users').then((usersFixture) => {
      usersFixture.forEach((user) => {
        login(user.email, user.password);
      });
    })
  })
})