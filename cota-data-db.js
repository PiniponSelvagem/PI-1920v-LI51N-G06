const { getGroupListPublic } = require('./app/js/cota-data')

const debug = require('debug')('cota:data-db')

const config = {
    host: 'localhost',
    port: 9200,
    index: "cota",
    max_results: 1000 // max results returned by elasticsearch -> DEFAULT: 10
}

module.exports = function (_fetch, _error) {
    const fetch = _fetch
    const error = _error
    const uriManager = new UriManager()

    return {
        getGroupListAll       : getGroupListAll,
        getGroupPublicListAll : getGroupPublicListAll,
        addGroup              : addGroup,
        getGroup              : getGroup,
        editGroup             : editGroup,
        addSerieToGroup       : addSerieToGroup,
        removeSeriesFromGroup : removeSeriesFromGroup,
        findGroup             : findGroup
    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        this.getGroupListAllUri = (username) => `${baseUri}_search?q=username:${username}&size=${config.max_results}`
        this.getGroupPublicListAllUri = () => `${baseUri}_search?q=share:public&size=${config.max_results}`
        this.addGroupUri = () => `${baseUri}_doc`
        this.getGroupUri = (id) => `${baseUri}_doc/${id}`
        this.editGroupUri = (id) => `${baseUri}_doc/${id}/_update`
        this.addSerieToGroupUri = (id) => `${baseUri}_doc/${id}/_update`
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
                        share: group._source.share,
                        name: group._source.name,
                        description: group._source.description
                    }
                }))
            .then(body => { debug(`getGroupListAll found ${body.length} groups`); return body; })
    }

    function getGroupPublicListAll() {
        const uri = uriManager.getGroupPublicListAllUri()
        return makeRequest(uri)
            .then(body => body.hits.hits.map(
                group => {
                    return {
                        id: group._id,
                        username: group._source.username,
                        name: group._source.name,
                        description: group._source.description
                    }
                }))
            .then(body => { debug(`getGroupPublicListAll found ${body.length} groups`); return body; })
    }

    function addGroup(user, shareType, groupName, groupDesc) {
        let group = {
            username: user.username,
            share: shareType,
            name: groupName,
            description: groupDesc,
            series: []
        }

        const uri = uriManager.addGroupUri()
        return makeRequest(uri, setPostOptions(script), true)
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
                if (!user || group._source.username != user.username) {
                    if (group._source.share == "private") {
                        return Promise.resolve(error.get(84))
                    }
                }

                let groupOutput = {
                    id: group._id,
                    username: group._source.username,
                    share: group._source.share,
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

        const uri = uriManager.editGroupUri(groupId)
        return getGroupToModify(user, groupId)
            .then(() => makeRequest(uri, setPostOptions(script), true)
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
        return getGroupToModify(user, groupId)
            .then(() => makeRequest(uri, setPostOptions(script), true)
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
        return getGroupToModify(user, groupId)
            .then(() => makeRequest(uri, setPostOptions(script), true)
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
        return getGroupPublicListAll()
                .then(groups => findById(user, groupId, groups))
                .then(group => {
                    if (!group) {
                        return getGroupListAll(user)
                                    .then(groups => findById(user, groupId, groups))
                    }
                    return group
                })
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

    function setPostOptions(data) {
        return {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }
    }

    async function findById(user, id, array) {
        let group = array.find(item => (item.id == id))
        if (!group) return
        let series = await getGroup(user, id)
        return series
    }

    function getGroupToModify(user, groupId) {
        return getGroup(user, groupId)
            .then(group => {
                if(group.username != user.username) {
                    return Promise.reject(error.get(85))
                }
                return group
            })
    }
}