window.onload = function (e) {
    let context = {}
    const cotaData = require('./cota-data')
    const templates = require('./templates')
    const authStates = require('./auth-controller')(cotaData, templates, context)
    const cotaStates = require('./cota-controller')(cotaData, templates, context)

    const states = Object.assign(authStates, cotaStates)
    require('./state-router')(states, "tvpopular")
}