import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from 'bcrypt';
function initialize(passport, getUserByEmail, getUserById) {
    const verifyCallback = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            }
            else {
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
        done(null, user._id);
    });
    passport.deserializeUser(async function (_id, done) {
        try {
            const user = await getUserById(_id);
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    });
}
export default initialize;
