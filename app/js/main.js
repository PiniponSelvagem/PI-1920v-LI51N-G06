window.onload = function (e) {
    const cotaData = require('./cota-data')
    //const authStates = require('./auth-controller')(issuesData)
    const cotasStates = require('./cota-controller')(cotaData)

    const states = cotasStates //Object.assign(authStates, issuesStates)
    require('./state-router')(states, "tvpopular")
}