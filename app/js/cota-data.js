module.exports = {
    getTvPopular         : getTvPopular,
    getTvSearch          : getTvSearch,
    getGroupList         : getGroupList,
    getGroup             : getGroup,
    createGroup          : createGroup,
    editGroup            : editGroup,
    addSerieToGroup      : addSerieToGroup,
    getSeriesByVote      : getSeriesByVote,
    deleteSerieFromGroup : deleteSerieFromGroup,

    login       : login,
    currentUser : currentUser,
    logout      : logout
}

function UriManager() {
    const config = {
        host: 'localhost',
        port: 8080,
        baseApi: "cota/api",
        data: "data/",
        auth: "auth/"
    }

    const dataUri = `http://${config.host}:${config.port}/${config.baseApi}/${config.data}`
    this.getTvPolularUri = () => `${dataUri}tv/popular`
    this.getTvSearchUri = (query) => `${dataUri}tv/search?query=${query}`
    this.getGroupListUri = () => `${dataUri}series/group/list`
    this.getGroupUri = (id) => `${dataUri}series/group/${id}`
    this.getAddGroupUri = () => `${dataUri}series/group`
    this.getEditGroupUri = (id) => `${dataUri}series/group/${id}`
    this.getSerieAddGroupUri = (id) => `${dataUri}series/group/${id}/series`
    this.getSeriesByVoteUri = (id, min, max) => `${dataUri}series/group/${id}/series?min=${min}&max=${max}`
    this.getDeleteSerieFromGroupUri = (groupId, serieId) => `${dataUri}series/group/${groupId}/series/${serieId}`

    const authUri = `http://${config.host}:${config.port}/${config.baseApi}/${config.auth}`
    this.getLoginUri = () => `${authUri}login`
    this.getCurrentUserUri = () => `${authUri}currentuser`
    this.getLogoutUri = () => `${authUri}logout`
}

const uriManager = new UriManager()



////// Functions executed in each page state
function getTvPopular() {
    return fetch(uriManager.getTvPolularUri())
        .then(rsp => rsp.json())
}

function getTvSearch(query) {
    return fetch(uriManager.getTvSearchUri(query))
        .then(rsp => rsp.json())
}

function getGroupList() {
    return fetch(uriManager.getGroupListUri())
        .then(rsp => rsp.json())
}

function getGroup(id) {
    return fetch(uriManager.getGroupUri(id))
        .then(rsp => rsp.json())
}

function createGroup(group) {
    return fetch(uriManager.getAddGroupUri(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(group)
    }).then(rsp => rsp.json())
}

function editGroup(id, group) {
    return fetch(uriManager.getEditGroupUri(id), {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(group)
    }).then(rsp => rsp.json())
}

function addSerieToGroup(groupId, serieId) {
    const serie = { id: serieId }
    return fetch(uriManager.getSerieAddGroupUri(groupId), {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(serie)
    }).then(rsp => rsp.json())
}

function getSeriesByVote(groupId, voteRange) {
    return fetch(uriManager.getSeriesByVoteUri(groupId, voteRange.votelow, voteRange.votehigh))
        .then(rsp => rsp.json())
}

function deleteSerieFromGroup(groupId, serieId) {
    return fetch(uriManager.getDeleteSerieFromGroupUri(groupId, serieId), {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        }
    }).then(rsp => rsp.json())
}



function login(username, password) {
    const credentials = {
        username: username,
        password: password
    }

    return fetch(uriManager.getLoginUri(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(credentials)
    }).then(rsp => rsp.json())
}

function currentUser() {
    return fetch(uriManager.getCurrentUserUri())
        .then(rsp => rsp.json())
}

function logout() {
    return fetch(uriManager.getLogoutUri(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
    }).then(rsp => rsp.json())
}