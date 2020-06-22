
const debug = require('debug')('cota:data-services')

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

    function getGroupListAll(user) {
        return cotaDb.getGroupListAll(user)
    }

    function addGroup(user, groupName, groupDesc) {
        if (!groupName || !groupDesc) {
            return Promise.reject(error.get(20))
        }
        
        return cotaDb.addGroup(user, groupName, groupDesc)
    }

    function getGroup(user, id) {
        return cotaDb.getGroup(user, id)
    }

    function editGroup(user, id, name, description) {
        return cotaDb.editGroup(user, id, name, description)
    }

    function addSerieToGroup(user, groupId, seriesId) {
        return movieDb.getTvSeriesWithID(seriesId, function(seriesMovieDb) {
            return seriesMovieDb.then((_serie) => {
                const serie = {
                    id: _serie.id,
                    original_name: _serie.original_name,
                    name: _serie.name,
                    description: _serie.overview,
                    original_language: _serie.original_language
                }
                return cotaDb.addSerieToGroup(user, groupId, serie)
            })
        })
    }

    function removeSeriesFromGroup(user, groupId, seriesId) {
        return cotaDb.removeSeriesFromGroup(user, groupId, seriesId)
    }

    async function getGroupSeriesByVote(user, groupId, min = 0, max = 10) {
        debug(`Min=${min} & Max=${max}`)
        if (isNaN(min) || isNaN(max) || isInvalidRange(min, max)) {
            return Promise.reject(error.get(22))
        }
        const series = await cotaDb.getGroup(user, groupId)
            .then(group =>
                group.series.map( series => {
                    return movieDb.getTvSeriesWithID(series.id)
                    .then(seriesById => {
                        return {
                            id: seriesById.id,
                            original_name: seriesById.original_name,
                            name: seriesById.name,
                            description: seriesById.overview,
                            original_language: seriesById.original_language,
                            vote_average: seriesById.vote_average
                        }
                    })
                })
            )
        return series
            .filter(series => series.vote_average >= min && series.vote_average <= max)
            .sort((s1,s2) => s2.vote_average - s1.vote_average)
    }

    ///////////////////
    // AUX functions //
    ///////////////////
    function isInvalidRange(min, max) {
        return min > max || min < 0 || max > 10
    }
}