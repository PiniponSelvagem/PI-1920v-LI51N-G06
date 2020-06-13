
const debug = require('debug')('cota:web-api-auth')
const router = require('express').Router()

module.exports = function (_cotaAuthServices, _error) {
    const cotaAuthServices = _cotaAuthServices
    const error = _error

    //const AUTH_COOKIE_NAME = "Auth"

    router.post('/register', register)
    router.post('/login', login)
    //router.get('/currentuser', currentUser)
    router.post('/logout', logout)

    
    Promise.prototype.sendResponse = sendResponse

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
            .then(validateUser)
            .sendResponse(rsp)

        function validateUser(loginStatus) {
            console.log(loginStatus)
            if (loginStatus.ok) {
                req.logIn({
                    username: req.body.username
                }, (err) => rsp.json(loginStatus))
            }
            return loginStatus
        }
    }

    // GET .../currentuser
    /*
    function currentUser(req, rsp) {
        Promise.resolve({user: req.user}).then(rsp => {console.log(rsp); return rsp}).sendResponse(rsp)
    }
    */

    // POST .../logout
    function logout(req, rsp) {
        console.log(req.isAuthenticated(), req.user)
        cotaAuthServices.logout()
            .then(logoutUser)
            .sendResponse(rsp)

        function logoutUser(logoutStatus) {
            if (logoutStatus.ok) {
                req.logOut({}, (err) => rsp.json(logoutStatus))
            }
            return logoutStatus
        }
    }


    /*
    function validateLogin(req, rsp) {
        if(validateUser(req.body.username, req.body.password)) {
          console.log(req.body)
          req.logIn({
             username: req.body.username
          }, (err) => rsp.redirect('/home'))
          return;
        }
        else rsp.redirect('/login')
      
        function validateUser(){ return true; }
    }
      
    function verifyAuthenticated(req, rsp, next) {
        if(req.isAuthenticated())
            return next()
        rsp.status(403).send("Authenticate at '/login'")
    }
    */


    ///////////////////
    // AUX functions //   // NOTE: THIS CODE IS COMMON TO MODULE: cota-web-api-data
    ///////////////////
    function sendResponse(rsp, successStatusCode = 200, errorStatusCode = 500) {
        this.then(processSuccess(rsp, successStatusCode)).catch(processError(rsp, errorStatusCode))
    }

    function processSuccess(rsp, statusCode) {
        return processResponse(rsp, () => statusCode)
    }

    function processError(rsp, statusCode) {
        return processResponse(rsp, (data) => error.toHttpStatusCode(data))
    }


    function processResponse(rsp, statusCodeSup) {
        return function(data) {
            rsp.statusCode = statusCodeSup(data)
            //rsp.setHeader("Content-Type", "application/json")
            rsp.end(JSON.stringify(data))
        }
    }
}