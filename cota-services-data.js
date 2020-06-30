
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
        addScoreToSerie       : addScoreToSerie,
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
        return movieDb.getTvSeriesWithID(seriesId)
            .then(series => {
                const formatedSeries = {
                    id: series.id,
                    original_name: series.original_name,
                    name: series.name,
                    description: series.overview,
                    original_language: series.original_language
                }
                return cotaDb.addSerieToGroup(user, groupId, formatedSeries)
            })
    }

    function addScoreToSerie(user, groupId, seriesId, userScore) {
        return getGroup(user, groupId)
            .then(group =>  group.series)
            .then(series => {
                let idx = series.findIndex(serie => serie.id == seriesId)
                series[idx]['userScore'] = userScore
                debug(series)
                debug(userScore)
                return cotaDb.addScoreToSerie(user, groupId, idx, series[idx])
            })
    }

    function removeSeriesFromGroup(user, groupId, seriesId) {
        return cotaDb.removeSeriesFromGroup(user, groupId, seriesId)
    }

    function getGroupSeriesByVote(user, groupId, min = 0, max = 10) {
        debug(`Min=${min} & Max=${max}`)
        if (isNaN(min) || isNaN(max) || isInvalidRange(min, max)) {
            debug("God help me")
            return Promise.reject(error.get(22))
        }
        return cotaDb.getGroup(user, groupId)
            .then(group =>
                group.series.map( series => {
                    return movieDb.getTvSeriesWithID(series.id)
                        .then(serie => {
                            return {
                                id: serie.id,
                                original_name: serie.original_name,
                                name: serie.name,
                                description: serie.overview,
                                original_language: serie.original_language,
                                vote_average: serie.vote_average
                            }
                        })
                    }
                )
            )
            .then(mappedPromises => Promise.all(mappedPromises))
            .then(mappedSeries =>
                mappedSeries
                    .filter(series => series.vote_average >= min && series.vote_average <= max)
                    .sort((s1,s2) => s2.vote_average - s1.vote_average))
    }

    ///////////////////
    // AUX functions //
    ///////////////////
    function isInvalidRange(min, max) {
        return min > max || min < 0 || max > 10
    }
}