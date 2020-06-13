const { register } = require('./app/js/cota-data')

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
        // TODO
        return Promise.resolve({ok: true, username: credentials.username})
    }

    function login(credentials) {
        // TODO
        return Promise.resolve({ok: true, username: credentials.username})
    }

    function logout() {
        // TODO
        return Promise.resolve(true)
    }

    /*
    function addGroup(groupName, groupDesc) {
        if (!groupName || !groupDesc) {
            return Promise.reject(error.get(20))
        }
        
        return cotaDb.addGroup(groupName, groupDesc)
    }
    */
}