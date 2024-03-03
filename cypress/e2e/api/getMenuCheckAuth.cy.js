import { login } from '../e2e-general/login.js'

const getMenuAndCompare = (comparison) => {
  cy.request('GET', 'http://localhost:3000/menu')
    .its('body')
    .as('markup')
    .then(function () {
      expect(this.markup)
        .contains(comparison)
    })
}

describe('Get menu with and without auth', () => {
  it('returns nothing when not authenticated', () => {
    cy.fixture('my-users').then((usersFixture) => {
      getMenuAndCompare('');
    })
  })

  it('returns menu nav items when authenticated', () => {
    cy.fixture('my-users').then((usersFixture) => {
      login(usersFixture[0].email, usersFixture[0].password)
      getMenuAndCompare('data-cy="nav-swipe"');
    })
  })
})