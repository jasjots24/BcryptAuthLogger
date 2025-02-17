const { authenticate } = require('passport');
const bcrypt = require('bcrypt');

const localStrategy = require('passport-local').Strategy

function initialize(passport,getUserByEmail) {
    const authenticateUser=async(email, password, done)=>{

    const user = getUserByEmail(email);
    if(user== null){
        return done(null, false, {message:"No user exist with this email"})
    } 
    try{

        if(await bcrypt.compare(password, user.password)){
        return done(null, user)

        }else{
            return done(null, false, {message:"Password Incorrect"})}

    }catch(e){
        return done(e)
    }

    }
passport.use(new localStrategy({ usernameField: 'email'}, authenticateUser))
passport.serializeUser((user, done)=>{})
passport.deserializeUser((id, done)=>{})
}

module.exports = initialize