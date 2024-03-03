import { login } from '../e2e-general/login.js'
import crypto from 'crypto';

const editUsernameNotUnique = (newUsername) => {
  cy.request('POST', 'http://localhost:3000/profile/edit-username/', {
    username: newUsername
  })
    .its('body')
    .as('markup')
    .then(function () {
      expect(this.markup)
        .contains('in use')
        .contains('data-cy="profile-error"')
    })
}

const editUsernameAndCheckIt = (newUsername) => {
  cy.request('POST', 'http://localhost:3000/profile/edit-username/', {
    username: newUsername
  })
    .its('body')
    .as('markup')
    .then(function () {
      expect(this.markup)
        .contains(newUsername)
    })
}

const editPassword = (newPassword) => {
  cy.request('POST', 'http://localhost:3000/profile/edit-password/', {
    password: newPassword,
    passwordagain: newPassword,
  })
    .its('body')
    .as('markup')
    .then(function () {
      expect(this.markup)
        .contains('data-cy="profile-view"')
    })
}

describe('edit profile and check result', () => {
  it('display error username already exists', () => {
    cy.fixture('edit-me-user').then((user) => {
      login(user.email, user.password)

      // Try to use own current username 
      editUsernameNotUnique(user.username);
    })
  })

  it('displays new username on profile after posting change', () => {
    cy.fixture('edit-me-user').then((user) => {
      login(user.email, user.password)

      // Generate random username
      const randomBytes = crypto.randomBytes(64).toString('hex');
      editUsernameAndCheckIt(randomBytes);

      // Return to old username
      editUsernameAndCheckIt(user.username);
    })
  })

  it('allows login with new password after change', () => {
    cy.fixture('edit-me-user').then((user) => {
      login(user.email, user.password)

      // Generate random password
      const randomBytes = crypto.randomBytes(64).toString('hex');
      editPassword(randomBytes);

      // Check new password works
      login(user.email, randomBytes)

      // Return to old password
      editPassword(user.password);
    })
  })
})