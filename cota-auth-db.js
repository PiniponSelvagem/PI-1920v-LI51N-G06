
const debug = require('debug')('cota:data-db')

const config = {
    host: 'localhost',
    port: 9200,
    index: "cota_users",
    max_results: 10000 // max results returned by elasticsearch -> DEFAULT: 10
}

module.exports = function (_fetch, _error) {
    const fetch = _fetch
    const error = _error
    const uriManager = new UriManager()

    return {
        getUser : getUser,
        addUser : addUser
    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        this.getUserUri = () => `${baseUri}_search?&size=${config.max_results}`
        this.addUserUri = () => `${baseUri}_doc`
        this.refresh = () => `${baseUri}_refresh`
    }

    function getUser(credentials) {
        /*
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
        */
    }

    function addUser(credentials) {
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
        return makeRequest(uri, options, true)
            .then(body => { console.log(body); return body; })
            .then(body => { group.id = body._id; return group; })
            .then(body => { debug(`new group added with id: ${group.id}`); return body; })
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
}