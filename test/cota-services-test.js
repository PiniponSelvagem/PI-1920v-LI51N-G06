const chai = require('chai')
var expect = chai.expect;
const chaiPromise = require("chai-as-promised");
chai.use(chaiPromise)

const error = require('../cota-error')()
const authDbFile = require('./auth-db-mem.json')
const dataDbFile = require('./data-db-mem.json')

const cotaAuthDbMem = require('../cota-auth-db-mem')(authDbFile, error)
const cotaAuthServices = require('../cota-services-auth')(cotaAuthDbMem, error)

const cotaDataDbMem = require('../cota-data-db-mem')(dataDbFile, error)
const cotaDataServices = require('../cota-services-data')(cotaDataDbMem, error)


describe('cota-services-___ operations tests', cotaServicesOperationsTests)



function cotaServicesOperationsTests(param) {


    describe("Auth tests", () => {
        describe("Register new user", registerUserTest)
        describe("Register existing user", registerExistingUserTest)
        describe("Get existing user", getUserTest)
    })

    describe("Data tests", () => {
        //describe("Get a list of all groups from a user", getGroupListAllTest)
    })

    function registerUserTest() {
        it('should create a new user', () => {
            const credentials = {
                username: "testName3",
                password: "testPass3"
            }
            return cotaAuthServices.register(credentials)
                .then(user => expect(user.username).to.equal("testName3"))

        });
    }
    function registerExistingUserTest() {
        it('should return error 81', async () => {
            const credentials = {
                username: "testName1",
                password: "testPass1"
            }
            const result = await cotaAuthServices.register(credentials)
            expect(result).to.equal(error.get(81))
                // .then(res => { throw new Error('User already exists, shouldn\'t resolve.')} )
                // .catch(err => expect(err).to.equal(error.get(81)))
        });
    }
    function getUserTest() {

    }
}