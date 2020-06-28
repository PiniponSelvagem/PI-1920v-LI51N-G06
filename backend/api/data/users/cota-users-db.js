
const debug = require('debug')('cota:invites-db')

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
        //TODO

    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        //TODO
    }

    //TODO

    
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