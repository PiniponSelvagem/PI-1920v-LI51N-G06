
const debug = require('debug')('cota:services')

module.exports = function (_movieDb, _cotaDb, _error) {
    const movieDb = _movieDb
    const cotaDb = _cotaDb
    const error = _error

    return {
        getTvPopular         : getTvPopular,
        getTvSearch          : getTvSearch,
        getGroupListAll      : getGroupListAll,
        addGroup             : addGroup,
        getGroup             : getGroup,
        editGroup            : editGroup,
        addSerieToGroup      : addSerieToGroup,
        removeSerieFromGroup : removeSerieFromGroup,
        getGroupSeriesByVote : getGroupSeriesByVote
    }

    function getTvPopular(cb) {
        movieDb.getTvPopular(cb)
    }

    function getTvSearch(params, cb) {
        movieDb.getTvSearch(params, cb)
    }

    function getGroupListAll(cb) {
        cotaDb.getGroupListAll(cb)
    }

    function addGroup(groupToAdd, cb) {
        if (!groupToAdd.name || !groupToAdd.description) {
            return cb(error.get(20))
        }

        let id = cotaDb.getNewGroupId();
        let group = {
            id: id,
            name: name,
            description: description
        }
        cotaDb.addGroup(group, cb)
        debug(`new group added with id: ${group.id}`)
    }

    function getGroup(id, cb) {
        if (isInvalidId(id)) {
            return cb(error.get(23))
        }
        cotaDb.getGroup(id, cb)
    }

    function editGroup(id, name, description, cb) {
        if (isInvalidId(id) || !name || !description) {
            return cb(error.get(20))
        }

        const group = {
            id: id,
            name: name,
            description: description
        }
        cotaDb.editGroup(group, cb)
        debug(`edited group with id: ${group.id}`)
    }

    function addSerieToGroup(groupId, serieToAdd, cb) {
        if (isInvalidId(groupId) || isInvalidId(serieToAdd.id) || !serieToAdd.name || !serieToAdd.description) {
            return cb(error.get(21))
        }

        if (serieToAdd.vote_average < 0 || serieToAdd.vote_average > 10) {
            return cb(error.get(22))
        }

        const serie = {
            id: serieToAdd.id,
            original_name: serieToAdd.original_name ? serieToAdd.original_name : "not defined",
            name: serieToAdd.name,
            description: serieToAdd.description,
            original_language: serieToAdd.original_language ? serieToAdd.original_language : "not defined",
            vote_average: serieToAdd.vote_average
        }
        cotaDb.addSerieToGroup(groupId, serie, cb)
        debug(`added serie with id: ${serie.id} to group with id: ${groupId}`)
    }

    function removeSerieFromGroup(groupId, serieId, cb) {
        if (isInvalidId(groupId)) {
            return cb(error.get(23))
        }
        if (isInvalidId(serieId)) {
            return cb(error.get(24))
        }
        cotaDb.removeSerieFromGroup(groupId, serieId, cb)
        debug(`removed serie with id: ${serieId} from group with id: ${groupId}`)
    }

    function getGroupSeriesByVote(groupId, min, max, cb) {
        if (isInvalidId(groupId)) {
            return cb(error.get(23))
        }

        min = (min==undefined) ? 0 : min
        max = (max==undefined) ? 10 : max

        if (isInvalidRange(min, max)) {
            return cb(error.get(22))
        }
        
        debug(`requested series for group with id: ${groupId}, vote average range [${min}..${max}]`)
        cotaDb.getGroupSeriesByVote(groupId, min, max, cb)
    }


    ///////////////////
    // AUX functions //
    ///////////////////
    function isInvalidId(id) {
        return !id || !Number(id) || (id < 0)
    }

    function isInvalidRange(min, max) {
        return min > max || min < 0 || max > 10
    }
}