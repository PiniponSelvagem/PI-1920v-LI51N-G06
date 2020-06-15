const fetch = require('node-fetch')

const error = require('./cota-error')()
const cotaAuthDb = require('./cota-auth-db')(fetch, error)
const cotaAuthServices = require('./../cota-services-auth')(cotaAuthDb, error)

const config = {
    host: 'localhost',
    port: 9200,
    index: "cota_users"
}

describe('cota-services-auth operations test', cotaServicesOperationsTests)



function cotaServicesAuthOperationsTests(param) {
    describe("registerUser", registerUserTest)


    function registerUserTest() {
        
    }
}