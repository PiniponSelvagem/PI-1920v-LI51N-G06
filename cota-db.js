
const debug = require('debug')('cota:db')

module.exports = function (_error, COTA_DB = './json_files/COTA_DB') {
    const error = _error
    const groups = require(COTA_DB)

    return {
        getGroupListAll      : getGroupListAll,
        addGroup             : addGroup,
        getGroup             : getGroup,
        editGroup            : editGroup,
        addSeriesToGroup      : addSeriesToGroup,
        removeSeriesFromGroup : removeSeriesFromGroup,
        getGroupSeriesByVote : getGroupSeriesByVote
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
        cb(null, groupsOutput)
    }

    function addGroup(groupName, groupDesc, cb) {
        let group = {
            id: generateGroupId(),
            name: groupName,
            description: groupDesc
        }
        groups.push(group)
        debug(`new group added with id: ${group.id}`)
        cb(null, group)
    }

    function getGroup(groupId, cb) {
        const group = findGroup(groupId)
        if (!group) {
            return cb(error.get(10))
        }

        let groupOutput = {
            name: group.name,
            description: group.description,
            series: []
        }
        if(group.series) {
            groupOutput.series = group.series.map( (series) => {
                return {
                        id: series.id,
                        original_name: series.original_name,
                        name: series.name
                    }
            })
        }
        cb(null, groupOutput)
    }

    function editGroup(groupId, name, description, cb) {
        const group = findById(groupId, groups)
        if (!group) {
            return cb(error.get(11))
        }

        if(name) group.name = name
        if(description) group.description = description
        debug(`edited group with id: ${group.id}`)
        cb(null, group)
    }

    function addSeriesToGroup(groupId, series, cb) {
        const group = findById(groupId, groups);
        if(!group){
            return cb(error.get(10))
        }
        if (findById(series.id, group.series)) {
            return cb(error.get(40))
        }
        group.series.push(series)
        debug(`added series with id: ${series.id} to group with id: ${groupId}`)
        cb(null, series)
    }

    function removeSeriesFromGroup(groupId, seriesId, cb) {
        const group = findById(groupId, groups);
        if (!group) {
            return cb(error.get(11))
        }
        if (!findById(seriesId, group.series)) {
            return cb(error.get(13))
        }

        let seriesIndex = group.series.findIndex(s => s.id == seriesId);
        let series = group.series.splice(seriesIndex, 1);
        debug(`removed series with id: ${seriesId} from group with id: ${groupId}`)
        cb(null, series)
    }
    
    function getGroupSeriesByVote(groupId, min, max, cb) {
        const group = findById(groupId, groups)
        if (!group) {
            return cb(error.get(10))
        }

        let series = group.series.filter((s) => s.vote_average >= min && s.vote_average <= max)
        series.sort((s1,s2) => s2.vote_average - s1.vote_average);
        cb(null, series)
    }

    function findById(id, array) {
        return array.find(item => item.id == id)
    }
}