const debug = require('debug')('cota:auth-db-mem')

module.exports = function (dbFile, _error) {
    const error = _error

    return {
        getUser : getUser,
        addUser : addUser
    }

    function getUser(credentials) {
        const user = dbFile.find(user => user.username === credentials.username)

        if (!user) return Promise.reject(error.get(80))
        if (user.password !== credentials.password) return Promise.reject(error.get(82))

        return Promise.resolve({
            username: user.username
        })
    }

    function addUser(credentials) {
        const user = dbFile.find(user => user.username === credentials.username)

        if (user) return Promise.reject(error.get(81))

        dbFile.push(credentials)
        return Promise.resolve({username: credentials.username})
    }
}