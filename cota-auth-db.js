
const debug = require('debug')('cota:data-db')

const config = {
    host: 'localhost',
    port: 9200,
    index: "cota_users",
    //max_results: 1000 // max results returned by elasticsearch -> DEFAULT: 10
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
        this.getUserUri = () => `${baseUri}_search`
        this.addUserUri = () => `${baseUri}_doc`
        this.refresh = () => `${baseUri}_refresh`
    }

    function getUser(credentials) {
        const query = {
            "query": {
                "match": {
                    "username": credentials.username
                }
            }
        }

        return makeRequest(uriManager.getUserUri(), setPostOptions(query))
            .then(rsp => {
                if(rsp.error || rsp.hits.total.value == 0) {
                    return Promise.reject(error.get(80))
                }
                
                const user = rsp.hits.hits[0]._source

                if (user.password != credentials.password) {
                    return Promise.reject(error.get(82))
                }

                const userOutput = {
                    username: user.username
                }
                return userOutput
            })
    }

    async function addUser(credentials) {
        const query = {
            "query": {
                "match": {
                    "username": credentials.username
                }
            }
        }
        
        // check if user exists
        await makeRequest(uriManager.getUserUri(), setPostOptions(query))
            .then(rsp => {
                    if (rsp.error) {    // elasticsearch not created
                        /*
                            The reason why this is empty is because when accessing 'rsp.hits.total.value'
                            gives 'Uncaught TypeError, so we check if property error exists in 'rsp'
                            instead.
                        */
                        ;
                    }
                    else if (rsp.hits.total.value != 0) {
                        return Promise.reject(error.get(81))
                    }
                }
            )
        
        // add and return its username
        return makeRequest(uriManager.addUserUri(), setPostOptions(credentials))
            .then(rsp => {
                    if (rsp.result == "created") {
                        console.log("created")
                        const userOutput = {
                            username: credentials.username
                        }
                        return userOutput
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
        const body = await fetch(uri, options)
            .then(rsp => rsp.json())
        

        if (refresh) {
            await fetch(uriManager.refresh())
        }

        return body
    }

    function setPostOptions(data) {
        return {
            method: "POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }
    }
}