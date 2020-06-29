const { answerInvite } = require('../../../app/js/cota-data')

const debug = require('debug')('cota:services-data')

module.exports = function (_movieDb, _usersDb, _groupsDb, _invitesDb, _error) {
    const movieDb = _movieDb
    const usersDb = _usersDb
    const groupsDb = _groupsDb
    const invitesDb = _invitesDb
    const error = _error

    return {
        getUser               : getUser,
        getTvPopular          : getTvPopular,
        getTvSearch           : getTvSearch,
        getGroupListAll       : getGroupListAll,
        addGroup              : addGroup,
        getGroup              : getGroup,
        editGroup             : editGroup,
        addSerieToGroup       : addSerieToGroup,
        removeSeriesFromGroup : removeSeriesFromGroup,
        getGroupSeriesByVote  : getGroupSeriesByVote,
        inviteToGroup         : inviteToGroup,
        cancelInvite          : cancelInvite,
        getInvites            : getInvites,
        answerInvite          : answerInvite
    }

    function getUser(username) {
        //return usersDb.getUser(username)
    }
    
    function getTvPopular() {
        return movieDb.getTvPopular()
    }

    function getTvSearch(params) {
        return movieDb.getTvSearch(params)
    }

    function getGroupListAll(user) {
        return groupsDb.getGroupListAll(user)
    }

    function addGroup(user, groupName, groupDesc) {
        if (!groupName || !groupDesc) {
            return Promise.reject(error.get(20))
        }
        
        return groupsDb.addGroup(user, groupName, groupDesc)
    }

    function getGroup(user, id) {
        return groupsDb.getGroup(user, id)
            .then(group => {
                return invitesDb.getGroupInvites(id)
                    .then(invites => {
                        group.invites = invites
                        return group
                    })
            })
    }

    function editGroup(user, id, name, description) {
        return groupsDb.editGroup(user, id, name, description)
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
                return groupsDb.addSerieToGroup(user, groupId, formatedSeries)
            })
    }

    function removeSeriesFromGroup(user, groupId, seriesId) {
        return groupsDb.removeSeriesFromGroup(user, groupId, seriesId)
    }

    function getGroupSeriesByVote(user, groupId, min = 0, max = 10) {
        debug(`Min=${min} & Max=${max}`)
        if (isNaN(min) || isNaN(max) || isInvalidRange(min, max)) {
            debug("God help me")
            return Promise.reject(error.get(22))
        }
        return groupsDb.getGroup(user, groupId)
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

    function inviteToGroup(user, groupId, invitedUser) {
        return usersDb.getUser(invitedUser)
                .then( _=> groupsDb.getGroup(user, groupId))
                .then(group => {
                    if(group.collaborators.includes(invitedUser)) {
                        return Promise.reject(error.get(41))
                    }
                })
                .then( _=> invitesDb.addInvite(user, groupId, invitedUser))

    }

    function cancelInvite(user, groupId, inviteId) {
        return groupsDb.getGroup(user, groupId)
                .then(_=> invitesDb.deleteInvite(inviteId, groupId))
                .then(_ => invitesDb.getGroupInvites(groupId))
    }

    function getInvites(user) {
        return invitesDb.getInvites(user)
    }

    function answerInvite(user, inviteId, answer) {
        return invitesDb.getInvite(user, inviteId)
            .then(invite => {
                console.log(invite)
                if(answer == "accept") {
                    return groupsDb.addCollaborator(user, invite.groupId)
                        .then(_ => invitesDb.deleteInvite(inviteId, invite.groupId))
                        .then(_ => invitesDb.getInvites(user))
                }

                return invitesDb.deleteInvite(inviteId, invite.groupId)
                    .then(_ => invitesDb.getInvites(user))
            })
    }

    ///////////////////
    // AUX functions //
    //////////////////
    function isInvalidRange(min, max) {
        return min > max || min < 0 || max > 10
    }
}