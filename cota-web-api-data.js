
const debug = require('debug')('cota:web-api-data')
const router = require('express').Router()

module.exports = function (_cotaDataServices, _error) {
    const cotaDataServices = _cotaDataServices
    const error = _error

    router.get('/tv/popular', getTvPopular)
    router.get('/tv/search', getTvSearch)
    router.get('/series/group/list', getGroupListAll)
    router.get('/series/group/list/public', getGroupPublicListAll)
    router.post('/series/group', addGroup)
    router.get('/series/group/:gid', getGroup)
    router.post('/series/group/:gid', editGroup)
    router.post('/series/group/:gid/series', addSerieToGroup)
    router.delete('/series/group/:gid/series/:sid', removeSeriesFromGroup)
    router.get('/series/group/:gid/series', getGroupSeriesByVote)
    
    Promise.prototype.sendResponse = sendResponse

    return router

    // GET .../tv/popular
    function getTvPopular(req, rsp) {
        cotaDataServices.getTvPopular().sendResponse(rsp)
    }

    // GET .../tv/search
    function getTvSearch(req, rsp) {
        cotaDataServices.getTvSearch(req.query).sendResponse(rsp)
    }

    // GET .../series/group/list
    function getGroupListAll(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.getGroupListAll(req.user).sendResponse(rsp)
            : Promise.resolve(error.get(60)).sendResponse(rsp)
    }

    // GET .../series/group/list/public
    function getGroupPublicListAll(req, rsp) {
        cotaDataServices.getGroupPublicListAll().sendResponse(rsp)
    }

    // POST .../series/group
    function addGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.addGroup(req.user, req.body.share, req.body.name, req.body.description).sendResponse(rsp, 201)
            : Promise.resolve(error.get(60)).sendResponse(rsp)
    }

    // GET .../series/group/:gid
    function getGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.getGroup(req.user, req.params.gid).sendResponse(rsp)
            : Promise.resolve(error.get(60)).sendResponse(rsp)
    }

    // POST .../series/group/:gid
    function editGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.editGroup(req.user, req.params.gid, req.body.name, req.body.description).sendResponse(rsp)
            : Promise.resolve(error.get(60)).sendResponse(rsp)
    }

    // POST .../series/group/:gid/series
    function addSerieToGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.addSerieToGroup(req.user, req.params.gid, req.body.id).sendResponse(rsp, 201)
            : Promise.resolve(error.get(60)).sendResponse(rsp)
    }

    // DELETE .../series/group/:gid/series/:sid
    function removeSeriesFromGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.removeSeriesFromGroup(req.user, req.params.gid, req.params.sid).sendResponse(rsp)
            : Promise.resolve(error.get(60)).sendResponse(rsp)
    }

    // GET .../series/group/:gid/series
    function getGroupSeriesByVote(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.getGroupSeriesByVote(req.user, req.params.gid, req.query.min, req.query.max).sendResponse(rsp)
            : Promise.resolve(error.get(60)).sendResponse(rsp)
    }


    ///////////////////
    // AUX functions //
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
            rsp.setHeader("Content-Type", "application/json")
            rsp.end(JSON.stringify(data))
        }
    }
}