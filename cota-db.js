
const debug = require('debug')('cota:db')

module.exports = function (_error, COTA_DB = './json_files/COTA_DB') {
    const error = _error
    const groups = require(COTA_DB)

    return {
        getGroupListAll       : getGroupListAll,
        addGroup              : addGroup,
        getGroup              : getGroup,
        editGroup             : editGroup,
        addSerieToGroup       : addSerieToGroup,
        removeSeriesFromGroup : removeSeriesFromGroup,
        findGroup             : findGroup
    }

    function generateGroupId() {
        return groups[groups.length - 1].id + 1;
    }

    function getGroupListAll(cb) {
        let groupsOutput = groups.map( (group) => {
            return {
                    id: group.id,
                    name: group.name,
                    description: group.description
                }
        })
        debug(`getGroupListAll found ${groupsOutput.length} groups`)
        return Promise.resolve(groupsOutput)
    }

    function addGroup(groupName, groupDesc) {
        let group = {
            id: generateGroupId(),
            name: groupName,
            description: groupDesc,
            series: []
        }
        groups.push(group)
        debug(`new group added with id: ${group.id}`)
        return Promise.resolve(group)
    }

    function getGroup(groupId) {
        const group = findById(groupId, groups);
        if(!group) {
            return Promise.reject(error.get(10))
        }

        let groupOutput = {
            name: group.name,
            description: group.description,
        }
        groupOutput.series = group.series.map( (series) => {
            return {
                    id: series.id,
                    original_name: series.original_name,
                    name: series.name
                }
        })
        return Promise.resolve(groupOutput)
    }

    function editGroup(groupId, name, description) {
        const group = findById(groupId, groups);
        if(!group) {
            return Promise.reject(error.get(10))
        }

        if(name) group.name = name
        if(description) group.description = description
        debug(`edited group with id: ${group.id}`)
        return Promise.resolve(group)
    }

    function addSerieToGroup(groupId, serie) {
        const group = findById(groupId, groups);
        if(!group) {
            return Promise.reject(error.get(10))
        }
        if(findById(serie.id, group.series)) {
            return Promise.reject(error.get(40))
        }

        group.series.push(serie)
        debug(`added series with id: ${serie.id} to group with id: ${groupId}`)
        return Promise.resolve(serie)
    }

    function removeSeriesFromGroup(groupId, seriesId) {
        const group = findById(groupId, groups);
        if(!group) {
            return Promise.reject(error.get(10))
        }
        let seriesIndex = group.series.findIndex(s => s.id == seriesId);
        if (seriesIndex == -1) {
            return Promise.reject(error.get(13))
        }
        let series = group.series.splice(seriesIndex, 1);
        debug(`removed series with id: ${seriesId} from group with id: ${groupId}`)
        return Promise.resolve(series)
    }
    
    function findGroup (groupId) {
        return findById(groupId, groups)
    }

    ///////////////////
    // AUX functions //
    ///////////////////

    function findById(id, array) {
        return array.find(it => it.id == id)
    }
}