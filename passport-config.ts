//const LocalStrategy = require('passport-local').Strategy
import { Strategy as LocalStrategy } from "passport-local";

import bcrypt from 'bcrypt';
import { PassportStatic, DoneCallback } from 'passport';
import User, { IUser } from './models/User.js'

function initialize(passport: PassportStatic,
  getUserByEmail: (email: string) => Promise<IUser | null>,
  getUserById: (id: string) => Promise<IUser | null>) {
  const verifyCallback = async (email: string, password: string, done: any) => {
    const user: IUser | null = await getUserByEmail(email);

    if (!user) {
      console.log('User not found')
      return done(null, false)
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        console.log('user: ' + user.email + ' logged in!')
        return done(null, user)
      } else {
        console.log('Password incorrect')
        return done(null, false)
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, verifyCallback))
  passport.serializeUser(function (user: any, done) {
    done(null, user.id);
  });
  passport.deserializeUser(async function (id: string, done) {
    try {
      const user = await getUserById(id);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
}

export default initialize;