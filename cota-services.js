
const debug = require('debug')('cota:services')

module.exports = function (_movieDb, _cotaDb, _error) {
    const movieDb = _movieDb
    const cotaDb = _cotaDb
    const error = _error

    return {
        getTvPopular          : getTvPopular,
        getTvSearch           : getTvSearch,
        getGroupListAll       : getGroupListAll,
        addGroup              : addGroup,
        getGroup              : getGroup,
        editGroup             : editGroup,
        addSerieToGroup       : addSerieToGroup,
        removeSeriesFromGroup : removeSeriesFromGroup,
        getGroupSeriesByVote  : getGroupSeriesByVote
    }

    function getTvPopular() {
        return movieDb.getTvPopular()
    }

    function getTvSearch(params) {
        return movieDb.getTvSearch(params)
    }

    function getGroupListAll() {
        return cotaDb.getGroupListAll()
    }

    function addGroup(groupName, groupDesc) {
        if (!groupName || !groupDesc) {
            return Promise.reject(error.get(20))
        }
        
        return cotaDb.addGroup(groupName, groupDesc)
    }

    function getGroup(id) {
        if (isInvalidId(id)) {
            return Promise.reject(error.get(23))
        }
        return cotaDb.getGroup(id)
    }

    function editGroup(id, name, description) {
        if (isInvalidId(id)) {
            return Promise.reject(error.get(23))
        }

        return cotaDb.editGroup(id, name, description)
    }

    function addSerieToGroup(groupId, seriesId) {
        if (isInvalidId(groupId) || isInvalidId(seriesId)) {
            return Promise.reject(error.get(21))
        }

        return movieDb.getTvSeriesWithID(seriesId, function(seriesMovieDb) {
            return seriesMovieDb.then((_serie) => {
                const serie = {
                    id: _serie.id,
                    original_name: _serie.original_name,
                    name: _serie.name,
                    description: _serie.overview,
                    original_language: _serie.original_language,
                    vote_average: _serie.vote_average
                }
                return cotaDb.addSerieToGroup(groupId, serie)
            })
        })
    }

    function removeSeriesFromGroup(groupId, seriesId) {
        if (isInvalidId(groupId)) {
            return Promise.reject(error.get(23))
        }
        if (isInvalidId(seriesId)) {
            return Promise.reject(error.get(24))
        }
        return cotaDb.removeSeriesFromGroup(groupId, seriesId)
    }

    function getGroupSeriesByVote(groupId, min = 0, max = 10) {
        if (isInvalidId(groupId)) {
            return Promise.reject(error.get(23))
        }

        debug(`Min=${min} & Max=${max}`)
        if (isNaN(min) || isNaN(max) || isInvalidRange(min, max)) {
            return Promise.reject(error.get(22))
        }
        const group = cotaDb.findGroup(groupId)
        if(!group) {
            return Promise.reject(error.get(10))
        }
        const series = group.series
        if(!series) {
            return Promise.resolve([])
        }

        let seriesByVote = []

        function getSeriesWithAverage (id) {
            return movieDb.getTvSeriesWithID(id, function(seriesMovieDb) {
                return seriesMovieDb.then((_serie) => {
                    const s = {
                        id: _serie.id,
                        original_name: _serie.original_name,
                        name: _serie.name,
                        description: _serie.overview,
                        original_language: _serie.original_language,
                        vote_average: _serie.vote_average
                    }
                    seriesByVote.push(s)
                    if(seriesByVote.length == series.length) {
                        seriesByVote = seriesByVote.filter((item) => item.vote_average >= min && item.vote_average <= max)
                        seriesByVote.sort((s1,s2) => s2.vote_average - s1.vote_average);
                        return Promise.resolve(seriesByVote)
                    } else {
                        return getSeriesWithAverage(series[seriesByVote.length].id)
                    }
                })
            })
        }
        return getSeriesWithAverage(series[0].id)
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