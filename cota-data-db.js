
const debug = require('debug')('cota:data-db')

const _config = {
    host: 'localhost',
    port: 9200,
    index: "cota",
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
        addScoreToSerie       : addScoreToSerie,
        removeSeriesFromGroup : removeSeriesFromGroup
    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        this.getGroupListAllUri = (username) => `${baseUri}_search?q=username:${username}&size=${config.max_results}`
        this.addGroupUri = () => `${baseUri}_doc`
        this.getGroupUri = (id) => `${baseUri}_doc/${id}`
        this.editGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.addSerieToGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.addScoreToSerieUri = (id) => `${baseUri}_doc/${id}/_update`
        this.removeSeriesFromGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.refresh = () => `${baseUri}_refresh`
    }

    function getGroupListAll(user) {
        const uri = uriManager.getGroupListAllUri(user.username)
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
                            name: series.name,
                            description: series.description,
                            userScore: series.userScore
                        }
                })
                return groupOutput
            })
    }

    function editGroup(user, groupId, name, description, series) {
        let doc = {}
        if(name) doc.name = name
        if(description) doc.description = description
        if(series) doc.series = series
        const options = {
            method: "POST",
            body: JSON.stringify({ doc: doc }),
            headers: { 'Content-Type': 'application/json'}
        }
        const uri = uriManager.editGroupUri(groupId)

        debug(doc)

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
                    debug(body.error.root_cause)
                    return Promise.reject(error.get(10))
                }
                return serie;
            })
            .then(serie => { debug(`added series with id: ${serie.id} to group with id: ${groupId}`); return serie; })
        )
    }

    function addScoreToSerie(user, groupId, serieIdx, serie) {
        debug(serie)
        let script = {
            script: {
                source: "ctx._source.series[params.idx].userScore = params.serie.userScore",
                lang: "painless",
                params: { idx: serieIdx, serie: serie}
            }
        }
        const uri = uriManager.addScoreToSerieUri(groupId)
        const options = {
            method: "POST",
            body: JSON.stringify(script),
            headers: { 'Content-Type': 'application/json'}
        }
        debug(`Uri: ${uri}`)

        return getGroup(user, groupId)
            .then(makeRequest(uri, options, true)
                .then(body =>{
                    debug("==== made the request ====")
                    if (body.error) {
                        debug(body.error.caused_by)
                        return Promise.reject(error.get(10))
                    }
                    debug(body)
                    return body;
                })
                .then(group => { debug(`added score to series to group with id: ${group._id}`); return group; })
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
    
    ///////////////////
    // AUX functions //
    ///////////////////
    function makeRequest(uri, options, refresh) {
        debug(`request to (ElasticSearch) ${uri}`)
        return fetch(uri, options)
            .then(async rsp => {
                if (refresh) {
                    await fetch(uriManager.refresh())
                }
                return rsp;
            })
            .then(rsp => rsp.json())
    }
}