
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
        return cotaDb.getGroupListAll()
    }

    function addGroup(user, groupName, groupDesc) {
        if (!groupName || !groupDesc) {
            return Promise.reject(error.get(20))
        }
        
        return cotaDb.addGroup(groupName, groupDesc)
    }

    function getGroup(user, id) {
        return cotaDb.getGroup(id)
    }

    function editGroup(user, id, name, description) {
        return cotaDb.editGroup(id, name, description)
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
                return cotaDb.addSerieToGroup(groupId, serie)
            })
        })
    }

    function removeSeriesFromGroup(user, groupId, seriesId) {
        return cotaDb.removeSeriesFromGroup(groupId, seriesId)
    }

    async function getGroupSeriesByVote(user, groupId, min = 0, max = 10) {
        debug(`Min=${min} & Max=${max}`)
        if (isNaN(min) || isNaN(max) || isInvalidRange(min, max)) {
            return Promise.reject(error.get(22))
        }
        const group = await cotaDb.findGroup(groupId)
        if(!group) {
            return Promise.reject(error.get(10))
        }
        const series = group.series
        if(!series) {
            return Promise.resolve([])
        }

        let seriesByVote = []

        function getSeriesWithAverage(id) {
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
    function isInvalidRange(min, max) {
        return min > max || min < 0 || max > 10
    }
}