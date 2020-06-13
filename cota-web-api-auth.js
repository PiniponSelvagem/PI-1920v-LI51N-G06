
const debug = require('debug')('cota:web-api-auth')
const router = require('express').Router()

module.exports = function (_cotaAuthServices, _error) {
    const cotaAuthServices = _cotaAuthServices
    const error = _error

    //const AUTH_COOKIE_NAME = "Auth"

    router.post('/register', register)
    router.post('/login', login)
    router.get('/currentuser', currentUser)
    router.post('/logout', logout)

    
    Promise.prototype.sendResponse = sendResponse

    return router


    // POST .../register
    function register(req, rsp) {
        const credentials = req.body
        debug("REGISTERING USER: ", credentials)
        //cotaServices.addGroup(req.body.name, req.body.description).sendResponse(rsp, 201)
        cotaAuthServices.register(credentials)
            .sendResponse(rsp)
    }

    // POST .../login
    function login(req, rsp) {
        const credentials = req.body
        cotaAuthServices.login(credentials)
            .then(addAuthCookie)
            .sendResponse(rsp)

        function addAuthCookie(loginStatus) {
            if (loginStatus.ok) {
                req.logIn({
                    username: req.body.username
                }, (err) => rsp.json(loginStatus))
                //rsp.cookie(AUTH_COOKIE_NAME, credentials.username)
            }
            return loginStatus
        }
    }

    // GET .../currentuser
    function currentUser(req, rsp) {
        Promise.resolve({user: req.user}).sendResponse(rsp)
    }

    // POST .../logout
    function logout(req, rsp) {
        cotaAuthServices.logout()
            .then(removeAuthCookie)
            .sendResponse(rsp)

        function removeAuthCookie(logoutStatus) {
            if (logoutStatus.ok) {
                req.logOut({}, (err) => rsp.json(logoutStatus))
                //rsp.clearCookie(AUTH_COOKIE_NAME)
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
      
    function logout(req, rsp) {
        req.logOut()
        rsp.redirect('/home')
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