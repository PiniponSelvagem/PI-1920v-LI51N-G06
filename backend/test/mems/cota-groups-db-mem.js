const debug = require('debug')('cota:groups-db-mem')


module.exports = function (dbFile, _error) {
    const error = _error

    return {
        getGroupListAll       : getGroupListAll,
        addGroup              : addGroup,
        getGroup              : getGroup,
        editGroup             : editGroup,
        addSerieToGroup       : addSerieToGroup,
        removeSeriesFromGroup : removeSeriesFromGroup,
        findGroup             : findGroup
    }

    function getGroupListAll(user) {
        return Promise.resolve(
            dbFile
                .filter( group => group.user === user.username)
                .map( group => {
                    return {
                        id: group.id,
                        name: group.name,
                        description: group.description
                    }
            }))
    }

    function addGroup(user, groupName, groupDesc) {
        let group = {
            id: dbFile.length + 1,
            username: user.username,
            name: groupName,
            description: groupDesc,
            series: []
        }
        dbFile.push(group)
        return Promise.resolve(group)
    }

    function getGroup(user, groupId) {
        return Promise.resolve(dbFile.find(group => group.id === groupId))
            .then(group => {
                if (!group) return Promise.reject(error.get(10))
                if (group.user !== user.username) return Promise.reject(error.get(84))
                return {
                    id: group.id,
                    name: group.name,
                    description: group.description,
                    series: group.series
                }
            })
    }

    function editGroup(user, groupId, name, description) {
        return getGroup(user, groupId)
            .then(group => {
                if (name) group.name = name
                if (description) group.description = description
                return group
            })
    }

    function addSerieToGroup(user, groupId, serie) {
        return getGroup(user, groupId)
            .then(group => {
                group.series.push(serie)
                return serie
            })
    }

    function removeSeriesFromGroup(user, groupId, serieId) {
        return getGroup(user, groupId)
            .then(group => {
                let idx = group.series.findIndex(serie => serie.id === serieId)
                return group.series.splice(idx, 1)[0]
            })
    }


    async function findGroup(user, groupId) {
        getGroupListAll(user)
            .then(groups => findById(user, groupId, groups))
        return findById(user, groupId, groups)
    }

    async function findById(user, id, array) {
        let group = array.find(item => (item.id == id))
        if (!group) return
        let series = await getGroup(user, id)
        return series
    }
}