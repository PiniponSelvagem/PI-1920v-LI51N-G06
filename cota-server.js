require('dotenv').config();
const debug = require('debug')('cota:server')
const express = require('express')
const fetch = require('node-fetch')
const passport = require('passport') 
const expressSession = require('express-session');

const PORT = process.env.PORT

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

Promise.prototype.sendResponse = sendResponse

const error = require('./backend/cota-error')()

const movieDb = require('./backend/api/data/tv/movie-database')(fetch)
const cotaAuthDb = require('./backend/api/auth/cota-auth-db')(fetch, error)
const cotaUsersDb = require('./backend/api/data/users/cota-users-db')(fetch, error)
const cotaGroupsDb = require('./backend/api/data/groups/cota-groups-db')(fetch, error)
const cotaInvitesDb = require('./backend/api/data/invites/cota-invites-db')(fetch, error)

const cotaDataServices = require('./backend/api/data/cota-services-data')(movieDb, cotaUsersDb, cotaGroupsDb, cotaInvitesDb, error)
const cotaAuthServices = require('./backend/api/auth/cota-services-auth')(cotaAuthDb, error)

const dataApi = require('./backend/api/data/cota-api-data')(cotaDataServices, error)
const authApi = require('./backend/api/auth/cota-api-auth')(cotaAuthServices, error)

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

app.use('/cota/api/data', dataApi)
app.use('/cota/api/auth', authApi)
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
