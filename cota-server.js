
const PORT = 8080

const debug = require('debug')('cota:server')
const express = require('express')
const fetch = require('node-fetch')
const cookieParser = require('cookie-parser')

const movieDb = require('./movie-database-data')(fetch)
const error = require('./cota-error')()
const cotaDataDb = require('./cota-data-db')(fetch, error)
const cotaAuthDb = {} //require('./cota-auth-db')(fetch, error)
const cotaDataServices = require('./cota-services-data')(movieDb, cotaDataDb, error)
const cotaAuthServices = require('./cota-services-auth')(cotaAuthDb, error)
const webApiDataRouter = require('./cota-web-api-data')(cotaDataServices, error)
const webApiAuthRouter = require('./cota-web-api-auth')(cotaAuthServices, error)

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(addLoginInformation)

app.use('/cota/api/data', webApiDataRouter)
app.use('/cota/api/auth', webApiAuthRouter)
app.use('/', express.static('./public'))

app.listen(PORT, debug(`server listening on port ${PORT}`))



function addLoginInformation(req, rsp, next) {
    const user = req.cookies["Auth"];
    if (user) {
        debug(`User authenticated: ${user}`)
    }
    else {
        debug(`User NOT authenticated`)
    }
    req.user = user
    next()
}