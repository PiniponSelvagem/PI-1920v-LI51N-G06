
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
        addSeriesToGroup      : addSeriesToGroup,
        removeSeriesFromGroup : removeSeriesFromGroup,
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
        
        cotaDb.addGroup(groupName, groupDesc, cb)
    }

    function getGroup(id, cb) {
        if (isInvalidId(id)) {
            return cb(error.get(23))
        }
        cotaDb.getGroup(id, cb)
    }

    function editGroup(id, name, description, cb) {
        if (isInvalidId(id)) {
            return cb(error.get(23))
        }

        cotaDb.editGroup(id, name, description, cb)
    }

    function addSeriesToGroup(groupId, seriesId, cb) {
        if (isInvalidId(groupId) || isInvalidId(seriesId)) {
            return cb(error.get(21))
        }

        movieDb.getTvSeriesWithID(seriesId, function(seriesMovieDb, cbSeries) {
            const series = {
                id: seriesMovieDb.id,
                original_name: seriesMovieDb.original_name,
                name: seriesMovieDb.name,
                description: seriesMovieDb.overview,
                original_language: seriesMovieDb.original_language,
                vote_average: seriesMovieDb.vote_average
            }
            cotaDb.addSeriesToGroup(groupId, series, cbSeries)
        }, cb)
    }

    function removeSeriesFromGroup(groupId, seriesId, cb) {
        if (isInvalidId(groupId)) {
            return cb(error.get(23))
        }
        if (isInvalidId(seriesId)) {
            return cb(error.get(24))
        }
        cotaDb.removeSeriesFromGroup(groupId, seriesId, cb)
    }

    function getGroupSeriesByVote(groupId, min = 0, max = 10, cb) {
        if (isInvalidId(groupId)) {
            return cb(error.get(23))
        }

        debug(`Min=${min} & Max=${max}`)
        if (isNaN(min) || isNaN(max) || isInvalidRange(min, max)) {
            return cb(error.get(22))
        }
        const group = cotaDb.findGroup(groupId)
        if(!group) {
            return cb(erro.get(10))
        }
        const series = group.series
        if(!series) {
            return cb(null, [])
        }

        let seriesByVote = []

        function getSeriesWithAverage (id) {
            movieDb.getTvSeriesWithID(id, function(seriesMovieDb, cbSeries) {
                const s = {
                    id: seriesMovieDb.id,
                    original_name: seriesMovieDb.original_name,
                    name: seriesMovieDb.name,
                    description: seriesMovieDb.overview,
                    original_language: seriesMovieDb.original_language,
                    vote_average: seriesMovieDb.vote_average
                }
                seriesByVote.push(s)
                if(seriesByVote.length == series.length) {
                    seriesByVote = seriesByVote.filter((item) => item.vote_average >= min && item.vote_average <= max)
                    seriesByVote.sort((s1,s2) => s2.vote_average - s1.vote_average);
                    cbSeries(null, seriesByVote)
                } else {
                    getSeriesWithAverage(series[seriesByVote.length].id)
                }
            }, cb)
        }
        getSeriesWithAverage(series[0].id)
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