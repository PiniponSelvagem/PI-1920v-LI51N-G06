const chai = require('chai')
var expect = chai.expect;

const error = require('../cota-error')()
const authDbFile = require('./mocks/auth-db-mem.json')
const dataDbFile = require('./mocks/data-db-mem.json')
const movieDbFile = require('./mocks/movie-db-mem.json')

const cotaAuthDbMem = require('./mems/cota-auth-db-mem')(authDbFile, error)
const cotaAuthServices = require('../cota-services-auth')(cotaAuthDbMem, error)

const cotaDataDbMem = require('./mems/cota-data-db-mem')(dataDbFile, error)
const movieDataDbMem = require('./mems/movie-database-data-mem')(movieDbFile)
const cotaDataServices = require('../cota-services-data')(movieDataDbMem, cotaDataDbMem, error)


describe('cota-services-___ operations tests', cotaServicesOperationsTests)



function cotaServicesOperationsTests(param) {


    describe("Auth tests", function (){
        describe("Register new user", registerUserTest)
        describe("Fail to register existing user", registerExistingUserTest)
        describe("Get existing user", getUserTest)
        describe("Fail to get user with wrong password", getUserWrongPassowrdTest)
        describe("Fail to get non-existing user", getNonExistingUserTest)
    })

    describe("Data tests", function () {
        describe("Get a list of all groups from a user", getGroupListAllTest)
        describe("Add new group", addGroupTest)
        describe("Get an already existing group", getGroupTest)
        describe("Edit a group", editGroupTest)
        describe("Add a serie to existing group", addSerieToGroupTest)
        describe("Remove a serie from existing group", removeSeriesFromGroupTest)
    })

    function registerUserTest() {
        it('should create a new user', () => {
            const credentials = {
                username: "testName3",
                password: "testPass3"
            }
            return cotaAuthServices.register(credentials)
                .then(user => expect(user.username).to.equal(credentials.username))

        });
    }
    function registerExistingUserTest() {
        it('should return error 81', function () {
            const credentials = {
                username: "testName1",
                password: "testPass1"
            }
            return cotaAuthServices.register(credentials)
                .then(res => { throw new Error('User already exists, shouldn\'t resolve.')} )
                .catch(err => expect(err).to.equal(error.get(81)))
        });
    }
    function getUserTest() {
        it('should get existing user', function () {
            const credentials = {
                username: "testName1",
                password: "testPass1"
            }

            return cotaAuthServices.login(credentials)
                .then(res => expect(res.username).to.equal(credentials.username))
        });
    }
    function getUserWrongPassowrdTest() {
        it('should fail to login existing user', function () {
            const credentials = {
                username: "testName1",
                password: "testPass2"
            }

            return cotaAuthServices.login(credentials)
                .then(res => { throw new Error("Password should be wrong.") })
                .catch(err => expect(err).to.equal(error.get(82)))
        });
    }
    function getNonExistingUserTest() {
        it('should fail to login non-existing user', function () {
            const credentials = {
                username: "testName0",
                password: "testPass0"
            }

            return cotaAuthServices.login(credentials)
                .then(res => { throw new Error("User shouldn't exist.") })
                .catch(err => expect(err).to.equal(error.get(80)))
        });
    }

    function getGroupListAllTest() {
        it('should get a list of all groups from a user', function () {
            const user = {
                username: "testUser1"
            }

            return cotaDataServices.getGroupListAll(user)
                .then(res => expect(res).to.have.lengthOf(2))
        });

    }
    function addGroupTest() {
        it('should add a new group to an existing user', function () {
            const user = {
                username: "testUser1"
            }

            return cotaDataServices.addGroup(user, "testGroup4", "this is group 4")
                .then(group => expect(group.name).to.equal("testGroup4"))
        });
    }
    function getGroupTest() {
        it('should get an already existing group', function () {
            const user = {
                username: "testUser1"
            }

            return cotaDataServices.getGroup(user, "2")
                .then(group => expect(group.id).to.equal("2"))
        });
    }
    function editGroupTest() {
        it('should edit an already existing group', function () {
            const user = {
                username: "testUser1"
            }

            return cotaDataServices.editGroup(user, "2", "testEditGroup2", "this was edited")
                .then(group => {
                    expect(group.id).to.equal("2")
                    expect(group.name).to.equal("testEditGroup2")
                    expect(group.description).to.equal("this was edited")
                })
        });
    }
    function addSerieToGroupTest() {
        it('should add a serie to an already existing group', function () {
            const user = {
                username: "testUser1"
            }

            return cotaDataServices.addSerieToGroup(user, "2", 2)
                .then(series => {
                    expect(series.id).to.equal(2)
                    expect(series.name).to.equal("s2")
                })
        });
    }
    function removeSeriesFromGroupTest() {
        it('should remove a serie from a group', function () {
            const user = {
                username: "testUser1"
            }

            return cotaDataServices.removeSeriesFromGroup(user, "2", 5)
                .then(serie => {
                    expect(serie.id).to.equal(5)
                })
        });
    }
}