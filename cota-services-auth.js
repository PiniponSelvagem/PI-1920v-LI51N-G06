
const debug = require('debug')('cota:auth-services')

module.exports = function (_cotaAuthDb, _error) {
    const cotaAuthDb = _cotaAuthDb
    const error = _error

    return {
        register : register,
        login    : login,
        logout   : logout
    }


    function register(credentials) {
        return cotaAuthDb.addUser(credentials)
    }

    function login(credentials) {
        return cotaAuthDb.getUser(credentials)
    }

    function logout() {
        return Promise.resolve({})
    }
}