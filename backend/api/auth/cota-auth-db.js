
const debug = require('debug')('cota:auth-db')

const _config = {
    host: 'localhost',
    port: 9200,
    index: "cota-users",
    max_results: 1
}

module.exports = function (_fetch, _error, config = _config) {
    const fetch = _fetch
    const error = _error
    const uriManager = new UriManager()

    return {
        getUser : getUser,
        addUser : addUser
    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        this.getUserUri = (username) => `${baseUri}_search?q=username:${username}`
        this.addUserUri = () => `${baseUri}_doc`
        this.refresh = () => `${baseUri}_refresh`
    }

    function getUser(credentials) {
        return makeRequest(uriManager.getUserUri(credentials.username))
            .then(rsp => {
                if(rsp.error || rsp.hits.total.value == 0) {
                    return Promise.reject(error.get(80))
                }
                
                const user = rsp.hits.hits[0]._source

                if (user.password != credentials.password) {
                    return Promise.reject(error.get(82))
                }

                return {username: user.username}
            })
    }

    function addUser(credentials) {
        // check if user exists
        return makeRequest(uriManager.getUserUri(credentials.username))
            .then(rsp => {
                    if (rsp.error) {    // elasticsearch not created
                        /*
                            The reason why this is empty is because when accessing 'rsp.hits.total.value'
                            gives 'Uncaught TypeError, so we check if property error exists in 'rsp'
                            instead.
                        */
                        ;
                    }
                    else if (rsp.hits.total.value !== 0) {
                        return Promise.reject(error.get(81))
                    }
                }
            )
            .then( _ => makeRequest(uriManager.addUserUri(), setPostOptions(credentials), true))
            .then(rsp => {
                    if (rsp.result === "created") {
                        return {
                            username: credentials.username
                        }
                    }
                    else {
                        // ERROR 83 -> Some error occured when adding user to elasticsearch, contact administrator
                        return Promise.reject(error.get(83))
                    }
                }
            )
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

    function setPostOptions(data) {
        return {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }
    }
}