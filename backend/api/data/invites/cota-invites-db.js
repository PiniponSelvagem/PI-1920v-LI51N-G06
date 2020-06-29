
const debug = require('debug')('cota:invites-db')

const _config = {
    host: 'localhost',
    port: 9200,
    index: "cota-invites",
    max_results: 1000 // max results returned by elasticsearch -> DEFAULT: 10
}

module.exports = function (_fetch, _error, config = _config) {
    const fetch = _fetch
    const error = _error
    const uriManager = new UriManager()

    return {
        getGroupInvites   :   getGroupInvites,
        addInvite         :   addInvite,
        deleteInvite      :   deleteInvite,
        getInvites        :   getInvites,
        getInvite         :   getInvite
    }

    function UriManager() {
        const baseUri = `http://${config.host}:${config.port}/${config.index}/`
        this.getGroupInvitesUri = (groupId) => `${baseUri}_search?q=groupId:${groupId}`
        this.addInviteUri = () => `${baseUri}_doc`
        this.deleteInviteUri = (inviteId) => `${baseUri}_update/${inviteId}`
        this.getInvitesUri = (username) => `${baseUri}_search?q=to:${username}`
        this.getInviteUri = (inviteId) => `${baseUri}_doc/${inviteId}`
        this.refresh = () => `${baseUri}_refresh`
    }

    async function addInvite(user, groupId, invitedUsername) {
        const invites = await getGroupInvites(groupId)
        if(invites.length > 0 && invites.find( inv => inv.to == invitedUsername)) {
            return Promise.reject(error.get(41))
        }

        const body = {
            groupId: groupId,
            from: user.username,
            to: invitedUsername
        }
        return makeRequest(uriManager.addInviteUri(), "POST", body, true)
            .then(rsp => {
                body.id = rsp._id
                invites.push(body)
                return invites
            })
    }

    function getGroupInvites(groupId) {
        return makeRequest(uriManager.getGroupInvitesUri(groupId), "GET")
            .then(rsp => {
                if( rsp.error) {
                    console.log("rsp.erro on getGroupInvites")
                    //Index cota-invites isn't initialized yet
                    return []
                }

                const invites = rsp.hits.hits.map( invite => {
                    return {
                        id: invite._id,
                        groupId: invite._source.groupId,
                        from: invite._source.from,
                        to: invite._source.to
                    }
                })
                return invites
            })
    }

    function deleteInvite(inviteId, groupId) {
        const body = {
            script: {
                source: "if (ctx._source.groupId == params.gid) { ctx.op = 'delete'} else{ ctx.op = 'none'}",
                params : {
                    gid: groupId
                }
            }
        }
        return makeRequest(uriManager.deleteInviteUri(inviteId), "POST", body, true)
            .then(rsp => {
                if(rsp.error) {
                    return Promise.reject(error.get(75))
                }
                if( rsp.result != "deleted") {
                    return Promise.reject(error.get(76))
                }
                return rsp.result
            })
    }

    function getInvites(user) {
        return makeRequest(uriManager.getInvitesUri(user.username), "GET")
            .then(rsp => {
                if( rsp.error) {
                    console.log("Index not Created")
                    //Index cota-invites isn't initialized yet
                    return []
                }

                const invites = rsp.hits.hits.map( invite => {
                    return {
                        id: invite._id,
                        groupId: invite._source.groupId,
                        from: invite._source.from,
                        to: invite._source.to
                    }
                })
                return invites
            })
    }

    function getInvite(user, inviteId) {
        return makeRequest(uriManager.getInviteUri(inviteId), "GET")
            .then(invite => {
                if( invite.error) {
                    console.log("Index not Created")
                    //Index cota-invites isn't initialized yet
                    return Promise.reject(error.get(75))
                }

                if(!invite.found) {
                    return Promise.reject(error.get(75))
                }

                if(invite._source.to != user.username && invite._source.from != user.username) {
                    return Promise.reject(error.get(84))
                }

                return {
                    id: invite._id,
                    groupId: invite._source.groupId,
                    from: invite._source.from,
                    to: invite._source.to
                }
            })
    }

    
    ///////////////////
    // AUX functions //
    ///////////////////
    async function makeRequest(uri, method, body, refresh) {
        debug(`request to (ElasticSearch) ${uri}`)
        const options = {
            method: method,
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json'}
        }
        const result = await fetch(uri, options)
            .then(rsp => rsp.json())

        if (refresh) {
            await fetch(uriManager.refresh())
        }
        return result
    }
}