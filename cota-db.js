
const debug = require('debug')('cota:db')

const config = {
    host: 'localhost',
    port: 9200,
    index: "cota"
}

module.exports = function (_fetch, _error) {
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
        findGroup             : findGroup
    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        this.getGroupListAllUri = () => `${baseUri}_search/`
        this.addGroupUri = () => `${baseUri}_doc/`
        this.getGroupUri = (id) => `${baseUri}_doc/${id}`
        this.editGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.addSerieToGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.removeSeriesFromGroupUri = (id) => `${baseUri}_doc/${id}/_update`
    }

    function getGroupListAll() {
        const uri = uriManager.getGroupListAllUri()
        return makeRequest(uri)
            .then(body => body.hits.hits.map(
                group => {
                    return {
                        id: group._id,
                        name: group._source.name,
                        description: group._source.description
                    }
                }))
            .then(body => { debug(`getGroupListAll found ${body.length} groups`); return body; })
    }

    function addGroup(groupName, groupDesc) {
        let group = {
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
        return makeRequest(uri, options)
            .then(body => { group.id = body._id; return group; })
            .then(body => { debug(`new group added with id: ${group.id}`); return body; })
    }

    function getGroup(groupId) {
        const uri = uriManager.getGroupUri(groupId)
        return makeRequest(uri)
            .then(group => {
                if(!group.found) {
                    return Promise.reject(error.get(10))
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

    function editGroup(groupId, name, description) {
        let doc = {}
        if(name) doc.name = name
        if(description) doc.description = description
        const options = {
            method: "POST",
            body: JSON.stringify({ doc: doc}),
            headers: { 'Content-Type': 'application/json'}
        }
        const uri = uriManager.editGroupUri(groupId)
        return makeRequest(uri, options)
            .then(body => {
                if(body.error) {
                    return Promise.reject(error.get(10))
                }
                
                doc.id = body._id
                return doc
            })
            .then(body => { debug(`edited group with id: ${body.id}`); return body; })
    }

    function addSerieToGroup(groupId, serie) {
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
        return makeRequest(uri, options)
            .then(body => {
                return serie;
            })
            .then(serie => { debug(`added series with id: ${serie.id} to group with id: ${groupId}`); return serie; })
    }

    function removeSeriesFromGroup(groupId, serieId) {
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
        return makeRequest(uri, options)
            .then(body => {
                if(body.error) {
                    return Promise.reject(error.get(10))
                }
                return { serie: { id: serieId } };
            })
            .then(sid => { debug(`removed serie with id: ${serieId} from group with id: ${groupId}`); return sid; })
    }
    
    async function findGroup(groupId) {
        let groups = await getGroupListAll()
        return findById(groupId, groups)
    }

    ///////////////////
    // AUX functions //
    ///////////////////
    function makeRequest(uri, options) {
        debug(`request to (ElasticSearch) ${uri}`)
        return fetch(uri, options)
            .then(rsp => rsp.json())
    }

    async function findById(id, array) {
        let group = array.find(item => item.id == id)
        if (!group) return
        let series = await getGroup(id)
        return series
    }
}