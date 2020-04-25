
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
    router.post('/series/group/:gid/series', addSeriesToGroup)
    router.delete('/series/group/:gid/series/:sid', removeSeriesFromGroup)
    router.get('/series/group/:gid/series', getGroupSeriesByVote)
    
    return router

    // GET /cota/api/tv/popular
    function getTvPopular(req, rsp) {
        cotaServices.getTvPopular(processResponse(rsp))
    }

    // GET /cota/api/tv/search
    function getTvSearch(req, rsp) {
        cotaServices.getTvSearch(req.query, processResponse(rsp))
    }

    // GET /cota/api/series/group/list
    function getGroupListAll(req, rsp) {
        cotaServices.getGroupListAll(processResponse(rsp))
    }

    // POST /cota/api/series/group
    function addGroup(req, rsp) {
        cotaServices.addGroup(req.body.name, req.body.description, processResponse(rsp, 201))
    }

    // GET /cota/api/series/group/:gid
    function getGroup(req, rsp) {
        cotaServices.getGroup(req.params.gid, processResponse(rsp))
    }

    // POST /cota/api/series/group/:gid
    function editGroup(req, rsp) {
        cotaServices.editGroup(req.params.gid, req.body.name, req.body.description, processResponse(rsp, 201))
    }

    // POST /cota/api/series/group/:gid/series
    function addSeriesToGroup(req, rsp) {
        cotaServices.addSeriesToGroup(req.params.gid, req.body.id, processResponse(rsp, 201))
    }

    // DELETE /cota/api/series/group/:gid/series/:sid
    function removeSeriesFromGroup(req, rsp) {
        cotaServices.removeSeriesFromGroup(req.params.gid, req.params.sid, processResponse(rsp))
    }

    // GET /cota/api/series/group/:gid/series
    function getGroupSeriesByVote(req, rsp) {
        cotaServices.getGroupSeriesByVote(req.params.gid, req.query.min, req.query.max, processResponse(rsp))
    }


    ///////////////////
    // AUX functions //
    ///////////////////
    function processResponse(rsp, sucessStatusCode = 200) {
        return function processResp(err, cotaObject) {
            rsp.statusCode = err ? error.toHttpStatusCode(err) : sucessStatusCode
            rsp.setHeader("Content-Type", "application/json")
            if (err) {
                cotaObject = { error_code: err.id, message: err.message };
            }
            rsp.end(JSON.stringify(cotaObject))
        }
    }
}