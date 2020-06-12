window.onload = function (e) {
    const cotaData = require('./cota-data')
    const authStates = require('./auth-controller')(cotaData)
    const cotaStates = require('./cota-controller')(cotaData)

    const states = Object.assign(authStates, cotaStates)
    require('./state-router')(states, "tvpopular")
}