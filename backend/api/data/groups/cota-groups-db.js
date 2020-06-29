
const debug = require('debug')('cota:groups-db')

const _config = {
    host: 'localhost',
    port: 9200,
    index: "cota-groups",
    max_results: 1000 // max results returned by elasticsearch -> DEFAULT: 10
}

module.exports = function (_fetch, _error, config = _config) {
    const fetch = _fetch
    const error = _error
    const uriManager = new UriManager()

    return {
        getGroupListAll       : getGroupListAll,
        addGroup              : addGroup,
        getGroup              : getGroup,
        editGroup             : editGroup,
        addSerieToGroup       : addSerieToGroup,
        removeSeriesFromGroup : removeSeriesFromGroup,
        addCollaborator       : addCollaborator 
    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        this.getGroupListAllUri = () => `${baseUri}_search`
        this.addGroupUri = () => `${baseUri}_doc`
        this.getGroupUri = (id) => `${baseUri}_doc/${id}`
        this.editGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.addSerieToGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.removeSeriesFromGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.addCollaboratorUri = (id) => `${baseUri}_doc/${id}/_update`
        this.refresh = () => `${baseUri}_refresh`
    }

    function getGroupListAll(user) {
        const body = {
            query: {
                query_string: {
                    default_field: "collaborators",
                    query: user.username
                }
            }
        }

        const options = {
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json'}
        }

        const uri = uriManager.getGroupListAllUri()
        return makeRequest(uri, options)
            .then(body => {
                console.log(body)
                body.hits.hits.map(
                group => {
                    return {
                        id: group._id,
                        name: group._source.name,
                        description: group._source.description
                    }
                })})
            .then(groups => { debug(`getGroupListAll found ${groups.length} groups`); return groups; })
    }

    function addGroup(user, groupName, groupDesc) {
        let group = {
            owner: user.username,
            collaborators: [user.username],
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
            .then(rsp => {
                if (!rsp.found) {
                    return Promise.reject(error.get(10))
                }
                const group = rsp._source
                if (!group.collaborators.includes(user.username)) {
                    return Promise.reject(error.get(84))
                }

                let groupOutput = {
                    id: rsp._id,
                    owner: group.owner,
                    collaborators: group.collaborators,
                    name: group.name,
                    description: group.description
                }
                groupOutput.series = group.series.map(series => {
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

    function addCollaborator(user, groupId) {
        let script = {
            script: {
                inline: "ctx._source.collaborators.add(params.user)",
                params: { user: `${user.username}` }
            }
        }

        const uri = uriManager.addCollaboratorUri(groupId)
        const options = {
            method: "POST",
            body: JSON.stringify(script),
            headers: { 'Content-Type': 'application/json'}
        }

        return makeRequest(uri, options, true)
            .then(body => {
                if (body.error) {
                    return Promise.reject(error.get(10))
                }
                return body
            })
            .then(body => { debug(`added collaborator to group with id: ${body._id}`); return body.result; })
    }
    
    ///////////////////
    // AUX functions //
    ///////////////////
    async function makeRequest(uri, options, refresh) {
        debug(`request to (ElasticSearch) ${uri}`)
        const result = await fetch(uri, options)
            .then(rsp => rsp.json())
            .then(json => {
                console.log(json)
                return json
            })
        if (refresh) {
            await fetch(uriManager.refresh())
        }
        return result
    }
}