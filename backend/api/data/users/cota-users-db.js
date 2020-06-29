
const debug = require('debug')('cota:users-db')

const _config = {
    host: 'localhost',
    port: 9200,
    index: "cota-users",
    max_results: 1000 // max results returned by elasticsearch -> DEFAULT: 10
}

module.exports = function (_fetch, _error, config = _config) {
    const fetch = _fetch
    const error = _error
    const uriManager = new UriManager()

    return {
        getUser : getUser
    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        this.getUserUri = (username) => `${baseUri}_search?q=username:${username}`
        this.refresh = () => `${baseUri}_refresh`
    }

    function getUser(username) {
        return makeRequest(uriManager.getUserUri(username))
            .then(rsp => {
                if(rsp.error || rsp.hits.total.value == 0) {
                    return Promise.reject(error.get(80))
                }
                
                const user = rsp.hits.hits[0]._source

                return {username: user.username}
            })
    }

    
    ///////////////////
    // AUX functions //
    ///////////////////
    async function makeRequest(uri, options, refresh) {
        debug(`request to (ElasticSearch) ${uri}`)
        const result = await fetch(uri, options)
            .then(rsp => rsp.json())
        if (refresh) {
            await fetch(uriManager.refresh())
        }
        return result
    }
}