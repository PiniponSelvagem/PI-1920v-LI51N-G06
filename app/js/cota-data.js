module.exports = {
    getTvPopular         : getTvPopular,
    getTvSearch          : getTvSearch,
    getGroupList         : getGroupList,
    getGroup             : getGroup,
    createGroup          : createGroup,
    editGroup            : editGroup,
    addSerieToGroup      : addSerieToGroup,
    getSeriesByVote      : getSeriesByVote,
    deleteSerieFromGroup : deleteSerieFromGroup
}

function UriManager() {
    const config = {
        host: 'localhost',
        port: 8080,
        baseApi: "cota/api/"
    }

    const baseUri = `http://${config.host}:${config.port}/${config.baseApi}`
    this.getTvPolularUri = () => `${baseUri}tv/popular`
    this.getTvSearchUri = (query) => `${baseUri}tv/search?query=${query}`
    this.getGroupListUri = () => `${baseUri}series/group/list`
    this.getGroupUri = (id) => `${baseUri}series/group/${id}`
    this.getAddGroupUri = () => `${baseUri}series/group`
    this.getEditGroupUri = (id) => `${baseUri}series/group/${id}`
    this.getSerieAddGroupUri = (id) => `${baseUri}series/group/${id}/series`
    this.getSeriesByVoteUri = (id, min, max) => `${baseUri}series/group/${id}/series?min=${min}&max=${max}`
    this.deleteSerieFromGroupUri = (groupId, serieId) => `${baseUri}series/group/${groupId}/series/${serieId}`
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
    return fetch(uriManager.deleteSerieFromGroupUri(groupId, serieId), {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        }
    }).then(rsp => rsp.json())
}