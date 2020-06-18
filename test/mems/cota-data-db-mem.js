const debug = require('debug')('cota:data-db')


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
            username: user.username,
            name: groupName,
            description: groupDesc,
            series: []
        }

        const uri = uriManager.addGroupUri()
        const options = {
            method: "POST",
            body: JSON.stringify(group),
            headers: { 'Content-Type': 'application/json'}
        }
        return makeRequest(uri, options, true)
            .then(body => { group.id = body._id; return group; })
            .then(body => { debug(`new group added with id: ${group.id}`); return body; })
    }

    function getGroup(user, groupId) {
        const uri = uriManager.getGroupUri(groupId)
        return makeRequest(uri)
            .then(group => {
                if (!group.found) {
                    return Promise.reject(error.get(10))
                }
                if (group._source.username != user.username) {
                    return Promise.reject(error.get(84))
                }

                let groupOutput = {
                    id: group._id,
                    name: group._source.name,
                    description: group._source.description
                }
                groupOutput.series = group._source.series.map(series => {
                    return {
                            id: series.id,
                            original_name: series.original_name,
                            name: series.name
                        }
                })
                return groupOutput
            })
    }

    function editGroup(user, groupId, name, description) {
        let doc = {}
        if(name) doc.name = name
        if(description) doc.description = description
        const options = {
            method: "POST",
            body: JSON.stringify({ doc: doc }),
            headers: { 'Content-Type': 'application/json'}
        }
        const uri = uriManager.editGroupUri(groupId)

        return getGroup(user, groupId).then(makeRequest(uri, options, true)
            .then(body => {
                if(body.error) {
                    return Promise.reject(error.get(10))
                }
                
                doc.id = body._id
                return doc
            })
            .then(body => { debug(`edited group with id: ${body.id}`); return body; })
        )
    }

    function addSerieToGroup(user, groupId, serie) {
        let script = {
            script: {
                inline: "ctx._source.series.add(params.serie)",
                lang: "painless",
                params: { serie: serie }
            }
        }

        const uri = uriManager.addSerieToGroupUri(groupId)
        const options = {
            method: "POST",
            body: JSON.stringify(script),
            headers: { 'Content-Type': 'application/json'}
        }
        return getGroup(user, groupId).then(makeRequest(uri, options, true)
            .then(body => {
                if (body.error) {
                    return Promise.reject(error.get(10))
                }
                return serie;
            })
            .then(serie => { debug(`added series with id: ${serie.id} to group with id: ${groupId}`); return serie; })
        )
    }

    function removeSeriesFromGroup(user, groupId, serieId) {
        let script = {
            script: {
                inline: `ctx._source.series.removeIf(serie -> serie.id == ${serieId})`,
                lang: "painless",
            }
        }

        const uri = uriManager.removeSeriesFromGroupUri(groupId)
        const options = {
            method: "POST",
            body: JSON.stringify(script),
            headers: { 'Content-Type': 'application/json'}
        }
        return getGroup(user, groupId).then(makeRequest(uri, options, true)
            .then(body => {
                if(body.error) {
                    return Promise.reject(error.get(10))
                }
                return { serie: { id: serieId } };
            })
            .then(sid => { debug(`removed serie with id: ${serieId} from group with id: ${groupId}`); return sid; })
        )
    }
    
    async function findGroup(user, groupId) {
        let groups = await getGroupListAll(user)
        return findById(user, groupId, groups)
    }


    
    ///////////////////
    // AUX functions //
    ///////////////////
    async function makeRequest(uri, options, refresh) {
        debug(`request to (ElasticSearch) ${uri}`)
        const body = await fetch(uri, options).then(rsp => rsp.json())

        if (refresh) {
            await fetch(uriManager.refresh())
        }

        return body
    }

    async function findById(user, id, array) {
        let group = array.find(item => (item.id == id))
        if (!group) return
        let series = await getGroup(user, id)
        return series
    }
}