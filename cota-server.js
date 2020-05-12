
const PORT = 8080

const debug = require('debug')('cota:server')
const express = require('express')
const fetch = require('node-fetch')

const movieDb = require('./movie-database-data')(fetch)
const error = require('./cota-error')()
const cotaDb = require('./cota-db')(fetch, error)
const cotaServices = require('./cota-services')(movieDb, cotaDb, error)
const webApiRouter = require('./cota-web-api')(cotaServices, error)

const app = express()

app.use(express.json())

app.use('/cota/api', webApiRouter)

app.listen(PORT, debug(`server listening on port ${PORT}`))
