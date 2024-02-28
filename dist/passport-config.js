import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from 'bcrypt';
function initialize(passport, getUserByEmail, getUserById) {
    const verifyCallback = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (!user) {
            console.log('User not found');
            return done(null, false);
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                console.log('user: ' + user.email + ' logged in!');
                return done(null, user);
            }
            else {
                console.log('Password incorrect');
                return done(null, false, { message: 'Incorrect username or password.' });
            }
        }
        catch (e) {
            return done(e);
        }
    };
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, verifyCallback));
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(async function (id, done) {
        try {
            const user = await getUserById(id);
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    });
}
export default initialize;
