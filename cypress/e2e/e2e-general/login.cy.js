import { login } from './login.js'

describe('login spec', () => {
  it('passes', () => {
    cy.fixture('my-users').then((usersFixture) => {
      usersFixture.forEach((user) => {
        login(user.email, user.password);
      });
    })
  })
})