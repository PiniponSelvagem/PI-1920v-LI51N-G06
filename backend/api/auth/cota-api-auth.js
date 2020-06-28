
const debug = require('debug')('cota:api-auth')
const router = require('express').Router()

module.exports = function (_cotaAuthServices, _error) {
    const cotaAuthServices = _cotaAuthServices
    const error = _error

    router.post('/register', register)
    router.post('/login', login)
    router.get('/currentUser', currentUser)
    router.post('/logout', logout)

    return router


    // POST .../register
    function register(req, rsp) {
        const credentials = req.body
        cotaAuthServices.register(credentials)
            .sendResponse(rsp)
    }

    // POST .../login
    function login(req, rsp) {
        const credentials = req.body
        cotaAuthServices.login(credentials)
            .then( user => {
                req.logIn(user, (err) => {})
                return user;
            })
            .sendResponse(rsp)
    }

    // GET ../currentuser
    function currentUser(req, rsp) {
        Promise.resolve(req.user)
            .sendResponse(rsp)
    }

    // POST .../logout
    function logout(req, rsp) {
        cotaAuthServices.logout()
            .then( logoutStatus => {
                req.logOut({}, (err) => {})
                return logoutStatus
            })
            .sendResponse(rsp)
    } 
}