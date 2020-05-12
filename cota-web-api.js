
const debug = require('debug')('cota:web-api')
const router = require('express').Router()

module.exports = function (_cotaServices, _error) {
    const cotaServices = _cotaServices
    const error = _error

    router.get('/tv/popular', getTvPopular)
    router.get('/tv/search', getTvSearch)
    router.get('/series/group/list', getGroupListAll)
    router.post('/series/group', addGroup)
    router.get('/series/group/:gid', getGroup)
    router.post('/series/group/:gid', editGroup)
    router.post('/series/group/:gid/series', addSerieToGroup)
    router.delete('/series/group/:gid/series/:sid', removeSeriesFromGroup)
    router.get('/series/group/:gid/series', getGroupSeriesByVote)
    
    Promise.prototype.sendResponse = sendResponse

    return router

    // GET /cota/api/tv/popular
    function getTvPopular(req, rsp) {
        cotaServices.getTvPopular().sendResponse(rsp)
    }

    // GET /cota/api/tv/search
    function getTvSearch(req, rsp) {
        cotaServices.getTvSearch(req.query).sendResponse(rsp)
    }

    // GET /cota/api/series/group/list
    function getGroupListAll(req, rsp) {
        cotaServices.getGroupListAll().sendResponse(rsp)
    }

    // POST /cota/api/series/group
    function addGroup(req, rsp) {
        cotaServices.addGroup(req.body.name, req.body.description).sendResponse(rsp, 201)
    }

    // GET /cota/api/series/group/:gid
    function getGroup(req, rsp) {
        cotaServices.getGroup(req.params.gid).sendResponse(rsp)
    }

    // POST /cota/api/series/group/:gid
    function editGroup(req, rsp) {
        cotaServices.editGroup(req.params.gid, req.body.name, req.body.description).sendResponse(rsp)
    }

    // POST /cota/api/series/group/:gid/series
    function addSerieToGroup(req, rsp) {
        cotaServices.addSerieToGroup(req.params.gid, req.body.id).sendResponse(rsp, 201)
    }

    // DELETE /cota/api/series/group/:gid/series/:sid
    function removeSeriesFromGroup(req, rsp) {
        cotaServices.removeSeriesFromGroup(req.params.gid, req.params.sid).sendResponse(rsp)
    }

    // GET /cota/api/series/group/:gid/series
    function getGroupSeriesByVote(req, rsp) {
        cotaServices.getGroupSeriesByVote(req.params.gid, req.query.min, req.query.max).sendResponse(rsp)
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