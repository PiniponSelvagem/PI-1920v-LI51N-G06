
const debug = require('debug')('cota:db')

module.exports = function (_error, COTA_DB = './json_files/COTA_DB') {
    const error = _error
    const groups = require(COTA_DB)
    let maxId = groups.length

    return {
        getNewGroupId        : getNewGroupId,
        getGroupListAll      : getGroupListAll,
        addGroup             : addGroup,
        getGroup             : getGroup,
        editGroup            : editGroup,
        addSerieToGroup      : addSerieToGroup,
        removeSerieFromGroup : removeSerieFromGroup,
        getGroupSeriesByVote : getGroupSeriesByVote
    }

    function getNewGroupId() {
        return ++maxId
    }

    function getGroupListAll(cb) {
        let groupsFiltered = []
        let i = 0;
        for (let k in groups) {
            groupsFiltered[i++] = {
                id: groups[k].id,
                name: groups[k].name,
                description: groups[k].description
            }
        }
        debug(`getGroupListAll found ${groupsFiltered.length} groups`)
        cb(null, groupsFiltered)
    }

    function addGroup(group, cb) {
        groups[groups.length] = group
        cb(null, group)
    }

    function getGroup(id, cb) {
        const group = groups.find(i => i.id == id)
        if (!group) {
            return cb(error.get(10))
        }
        let groupWithFilteredData = {
            name: group.name,
            description: group.description,
            series: []
        }
        for (let k in group.series) {
            groupWithFilteredData.series[k] = {
                id: group.series[k].id,
                original_name: group.series[k].original_name,
                name: group.series[k].name
            }
        }
        cb(null, groupWithFilteredData)
    }

    function editGroup(group, cb) {
        const groupToEdit = groups.find(i => i.id == group.id)
        if (!groupToEdit) {
            return cb(error.get(11))
        }
        if (group.name) groupToEdit.name = group.name
        if (group.description) groupToEdit.description = group.description
        cb(null, groupToEdit)
    }

    function addSerieToGroup(groupId, serie, cb) {
        const group = groups.find(i => i.id == groupId)
        if (!group) {
            return cb(error.get(12))
        }
        if (group.series.find(i => i.id == serie.id)) {
            return cb(error.get(40))
        }
        group.series[group.series.length] = serie
        cb(null, serie)
    }

    function removeSerieFromGroup(groupId, serieId, cb) {
        const group = groups.find(i => i.id == groupId);
        if (!group) {
            return cb(error.get(11))
        }
        if (!group.series.find(i => i.id == serieId)) {
            return cb(error.get(13))
        }

        const groupIdx = groups.findIndex(i => i.id == groupId)
        const serieIdx = groups[groupIdx].series.findIndex(i => i.id == serieId)
        const serie = groups[groupIdx].series.splice(serieIdx, 1)[0]
        cb(null, serie)
    }

    function getGroupSeriesByVote(groupId, min, max, cb) {
        const group = groups.find(i => i.id == groupId);
        if (!group) {
            return cb(error.get(10))
        }

        let series = []
        let i = 0
        for (let k in group.series) {
            const serieInDb = group.series[k]
            if (serieInDb.vote_average >= min && serieInDb.vote_average <= max) {
                series[i++] = serieInDb
            }
        }

        cb(null, series)
    }
}