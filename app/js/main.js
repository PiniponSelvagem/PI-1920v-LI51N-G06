window.onload = function (e) {
    let context = {}
    const cotaData = require('./cota-data')
    const authStates = require('./auth-controller')(cotaData, context)
    const cotaStates = require('./cota-controller')(cotaData, context)

    const states = Object.assign(authStates, cotaStates)
    require('./state-router')(states, "tvpopular")
}