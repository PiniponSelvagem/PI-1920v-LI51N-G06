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
    inviteToGroup        : inviteToGroup,
    cancelInvite         : cancelInvite,
    getInvites           : getInvites,
    answerInvite         : answerInvite,

    register       : register,
    login          : login,
    getCurrentUser : getCurrentUser,
    logout         : logout
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
    this.inviteToGroupUri = (groupId) => `${dataUri}series/group/${groupId}/invites`
    this.cancelInviteUri = (groupId) => `${dataUri}series/group/${groupId}/invites`
    this.getInvitesUri = () => `${dataUri}invites`
    this.answerInviteUri = (inviteId) => `${dataUri}invites/${inviteId}`

    const authUri = `http://${config.host}:${config.port}/${config.baseApi}/${config.auth}`
    this.getRegisterUri = () => `${authUri}register`
    this.getLoginUri = () => `${authUri}login`
    this.getCurrentUserUri = () => `${authUri}currentuser`
    this.getLogoutUri = () => `${authUri}logout`
}

const uriManager = new UriManager()



////// Functions executed in each page state

function getTvPopular() {
    return doFetch(uriManager.getTvPolularUri(), "GET")
}

function getTvSearch(query) {
    return doFetch(uriManager.getTvSearchUri(query), "GET")
}

function getGroupList() {
    return doFetch(uriManager.getGroupListUri(), "GET")
}

function getGroup(id) {
    return doFetch(uriManager.getGroupUri(id), "GET")
}

function createGroup(group) {
    return doFetch(uriManager.getAddGroupUri(), "POST", group)
}

function editGroup(id, group) {
    return doFetch(uriManager.getEditGroupUri(id), "POST", group)
}

function addSerieToGroup(groupId, serieId) {
    const serie = { id: serieId }
    return doFetch(uriManager.getSerieAddGroupUri(groupId), "POST", serie)
}

function getSeriesByVote(groupId, voteRange) {
    return doFetch(uriManager.getSeriesByVoteUri(groupId, voteRange.votelow, voteRange.votehigh), "GET")
}

function deleteSerieFromGroup(groupId, serieId) {
    return doFetch(uriManager.getDeleteSerieFromGroupUri(groupId, serieId), "DELETE")
}

function inviteToGroup(groupId, inviteName) {
    const body = { to: inviteName }
    return doFetch(uriManager.inviteToGroupUri(groupId), "POST", body)
}

function cancelInvite(groupId, inviteId) {
    const body = { id: inviteId }
    return doFetch(uriManager.cancelInviteUri(groupId), "DELETE", body)
}

function getInvites() {
    return doFetch(uriManager.getInvitesUri(), "GET")
}

function answerInvite(inviteId, answer) {
    const body = { answer: answer }
    return doFetch(uriManager.answerInviteUri(inviteId), "POST", body)
    .then(rsp => {
        console.log(rsp)
        return rsp
    })
}




function register(username, password) {
    const credentials = {
        username: username,
        password: password
    }

    return doFetch(uriManager.getRegisterUri(), "POST", credentials)
}

function login(username, password) {
    const credentials = {
        username: username,
        password: password
    }
    
    return doFetch(uriManager.getLoginUri(), "POST", credentials)
}

function getCurrentUser() {
    return doFetch(uriManager.getCurrentUserUri(), "GET")
}

function logout() {
    return doFetch(uriManager.getLogoutUri(), "POST")
}



///////////////////
// AUX functions //
///////////////////
function doFetch(uri, method, data) {
    return fetch(uri, {
        method: method,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(data)
    }).then(rsp => rsp.json())
}