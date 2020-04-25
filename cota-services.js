
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

    function addGroup(groupName, groupDesc, cb) {
        if (!groupName || !groupDesc) {
            return cb(error.get(20))
        }

        let id = cotaDb.getNewGroupId();
        let group = {
            id: id,
            name: groupName,
            description: groupDesc
        }
        cotaDb.addGroup(group, cb)
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
    }

    function addSerieToGroup(groupId, serieToAdd, cb) {
        if (isInvalidId(groupId) || isInvalidId(serieToAdd.id)) {
            return cb(error.get(21))
        }

        movieDb.getTvSerieWithID(serieToAdd.id, function(serieMovieDb, cbSerie) {
            const serie = {
                id: serieMovieDb.id,
                original_name: serieMovieDb.original_name,
                name: serieMovieDb.name,
                description: serieMovieDb.overview,
                original_language: serieMovieDb.original_language,
                vote_average: serieMovieDb.vote_average
            }
            cotaDb.addSerieToGroup(groupId, serie, cbSerie)
        }, cb)
    }

    function removeSerieFromGroup(groupId, serieId, cb) {
        if (isInvalidId(groupId)) {
            return cb(error.get(23))
        }
        if (isInvalidId(serieId)) {
            return cb(error.get(24))
        }
        cotaDb.removeSerieFromGroup(groupId, serieId, cb)
    }

    // TODO: get serieID, ask movieDB for serie with serieID and get average vote
    function getGroupSeriesByVote(groupId, min, max, cb) {
        if (isInvalidId(groupId)) {
            return cb(error.get(23))
        }

        min = (min==undefined) ? 0 : min
        max = (max==undefined) ? 10 : max

        if (isInvalidRange(min, max)) {
            return cb(error.get(22))
        }
        
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