
const PORT = 8080

const debug = require('debug')('cota:server')
const express = require('express')
const fetch = require('node-fetch')
const cookieParser = require('cookie-parser')
const passport = require('passport') 
const expressSession = require('express-session');

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

const movieDb = require('./movie-database-data')(fetch)
const error = require('./cota-error')()
const cotaDataDb = require('./cota-data-db')(fetch, error)
const cotaAuthDb = require('./cota-auth-db')(fetch, error)
const cotaDataServices = require('./cota-services-data')(movieDb, cotaDataDb, error)
const cotaAuthServices = require('./cota-services-auth')(cotaAuthDb, error)
const webApiDataRouter = require('./cota-web-api-data')(cotaDataServices, error)
const webApiAuthRouter = require('./cota-web-api-auth')(cotaAuthServices, error)

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

app.use(
    expressSession(
        {
            resave: false,
            saveUninitialized: true,
            //store: new FileStore(),
            secret: "Leeroy Jenkins"
        }
    )
)
//app.use(addLoginInformation)    //TODO remove when replaced with passport

app.use('/cota/api/data', webApiDataRouter)
app.use('/cota/api/auth', webApiAuthRouter)
app.use('/', express.static('./public'))

app.listen(PORT, debug(`server listening on port ${PORT}`))


function deserializeUser(user, done) {
    debug("deserializeUser", user)
    done(null, user)
}
  
  
function serializeUser(user, done) {
    debug("serializeUserCalled", user)
    done(null, user)
}

function addLoginInformation(req, rsp, next) {
    req.user = req.cookies["Auth"];
    next()
}