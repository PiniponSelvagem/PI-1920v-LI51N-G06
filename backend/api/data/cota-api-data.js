
const debug = require('debug')('cota:api-data')
const router = require('express').Router()

module.exports = function (_cotaDataServices, _error) {
    const cotaDataServices = _cotaDataServices
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
    router.post('/series/group/:gid/invites', inviteToGroup)
    router.delete('/series/group/:gid/invites', cancelInvite)
    router.get('/invites', getInvites)
    router.post('/invites/:iid', answerInvite)

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
            : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // POST .../series/group
    function addGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.addGroup(req.user, req.body.name, req.body.description).sendResponse(rsp, 201)
            : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // GET .../series/group/:gid
    function getGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.getGroup(req.user, req.params.gid).sendResponse(rsp)
            : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // POST .../series/group/:gid
    function editGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.editGroup(req.user, req.params.gid, req.body.name, req.body.description).sendResponse(rsp)
            : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // POST .../series/group/:gid/series
    function addSerieToGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.addSerieToGroup(req.user, req.params.gid, req.body.id).sendResponse(rsp, 201)
            : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // DELETE .../series/group/:gid/series/:sid
    function removeSeriesFromGroup(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.removeSeriesFromGroup(req.user, req.params.gid, req.params.sid).sendResponse(rsp)
            : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // GET .../series/group/:gid/series
    function getGroupSeriesByVote(req, rsp) {
        req.isAuthenticated()
            ? cotaDataServices.getGroupSeriesByVote(req.user, req.params.gid, parseFloat(req.query.min), parseFloat(req.query.max)).sendResponse(rsp)
            : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // POST /series/group/:gid/invites
    function inviteToGroup(req, rsp) {
        req.isAuthenticated()
        ? cotaDataServices.inviteToGroup(req.user, req.params.gid, req.body.to).sendResponse(rsp)
        : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // DELETE /series/group/:gid/invites
    function cancelInvite(req, rsp) {
        req.isAuthenticated()
        ? cotaDataServices.cancelInvite(req.user, req.params.gid, req.body.id).sendResponse(rsp)
        : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // GET /invites
    function getInvites(req, rsp) {
        req.isAuthenticated()
        ? cotaDataServices.getInvites(req.user).sendResponse(rsp)
        : Promise.reject(error.get(60)).sendResponse(rsp)
    }

    // POST /invites/:iid
    function answerInvite(req, rsp) {
        req.isAuthenticated()
        ? cotaDataServices.answerInvite(req.user, req.params.iid, req.body.answer).sendResponse(rsp)
        : Promise.reject(error.get(60)).sendResponse(rsp)
    }
}