
const debug = require('debug')('cota:web-api')
const router = require('express').Router()

module.exports = function (_cotaServices, _error) {
    const cotaServices = _cotaServices
    const error = _error

    router.get('/tv/popular', getTvPopular)
    router.get('/tv/search', getTvSearch)
    router.get('/serie/group/list', getGroupListAll)
    router.post('/serie/group', addGroup)
    router.get('/serie/group/:gid', getGroup)
    router.post('/serie/group/:gid', editGroup)
    router.post('/serie/group/:gid/series', addSerieToGroup)
    router.delete('/serie/group/:gid/series/:sid', removeSerieFromGroup)
    router.get('/serie/group/:gid/series', getGroupSeriesByVote)
    
    return router

    // GET /cota/api/tv/popular
    function getTvPopular(req, rsp) {
        cotaServices.getTvPopular(processResponse(rsp))
    }

    // GET /cota/api/tv/search
    function getTvSearch(req, rsp) {
        cotaServices.getTvSearch(req.query, processResponse(rsp))
    }

    // GET /cota/api/serie/group/list
    function getGroupListAll(req, rsp) {
        cotaServices.getGroupListAll(processResponse(rsp))
    }

    // POST /cota/api/serie/group
    function addGroup(req, rsp) {
        cotaServices.addGroup(req.body.name, req.body.description, processResponse(rsp, 201))
    }

    // GET /cota/api/serie/group/:gid
    function getGroup(req, rsp) {
        cotaServices.getGroup(req.params.gid, processResponse(rsp))
    }

    // POST /cota/api/serie/group/:gid
    function editGroup(req, rsp) {
        cotaServices.editGroup(req.params.gid, req.body.name, req.body.description, processResponse(rsp, 201))
    }

    // POST /cota/api/serie/group/:gid/series
    function addSerieToGroup(req, rsp) {
        const serie = {
            id: req.body.id
        }
        cotaServices.addSerieToGroup(req.params.gid, serie, processResponse(rsp, 201))
    }

    // DELETE /cota/api/serie/group/:gid/series/:sid
    function removeSerieFromGroup(req, rsp) {
        cotaServices.removeSerieFromGroup(req.params.gid, req.params.sid, processResponse(rsp))
    }

    // GET /cota/api/serie/group/:gid/series
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