
const PORT = 8080

const debug = require('debug')('cota:server')
const express = require('express')
const fetch = require('node-fetch')
const passport = require('passport') 
const expressSession = require('express-session');

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

Promise.prototype.sendResponse = sendResponse

const movieDb = require('./movie-database-data')(fetch)
const error = require('./cota-error')()
const cotaDataDb = require('./cota-data-db')(fetch, error)
const cotaAuthDb = require('./cota-auth-db')(fetch, error)
const cotaDataServices = require('./cota-services-data')(movieDb, cotaDataDb, error)
const cotaAuthServices = require('./cota-services-auth')(cotaAuthDb, error)
const webApiDataRouter = require('./cota-web-api-data')(cotaDataServices, error)
const webApiAuthRouter = require('./cota-web-api-auth')(cotaAuthServices, error)

const app = express()

app.use(
    expressSession(
        {
            resave: false,
            saveUninitialized: true,
            secret: "Leeroy Jenkins"
        }
    )
)

app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())

app.use('/cota/api/data', webApiDataRouter)
app.use('/cota/api/auth', webApiAuthRouter)
app.use('/', express.static('./public'))

app.listen(PORT, debug(`server listening on port ${PORT}`))


function deserializeUser(user, done) {
    //debug("deserializeUser", user)
    done(null, user)
}
  
  
function serializeUser(user, done) {
    //debug("serializeUserCalled", user)
    done(null, user)
}

///////////////////
// AUX functions //
///////////////////
function sendResponse(rsp, successStatusCode = 200, errorStatusCode = 500) {
    this.then(processSuccess(rsp, successStatusCode)).catch(processError(rsp, errorStatusCode))
}

function processSuccess(rsp, statusCode) {
    return function(data) {
        rsp.statusCode = statusCode
        rsp.end(JSON.stringify({result:data}))
    }
}

function processError(rsp, statusCode) {
    return function(err) {
        rsp.statusCode = error.toHttpStatusCode(err)
        rsp.end(JSON.stringify({error:err}))
    }
}
