module.exports = function(cotaData, templates, context) {
    const mainContent = document.querySelector("#main-content")

    return states = {
        tvpopular          : showTvPopular,
        tvsearch           : showTvSearch,
        grouplist          : showGroupList,
        group              : showGroup,
        seriegroupselector : showSerieAddGroupList,
        invites            : showInvites,
        nonauthenticated   : showNonAuthenticated
    }

    function showInvites() {
        cotaData.getInvites().then(showView)
    
        function showView(rsp) {
            mainContent.innerHTML = templates.invites(rsp.result)

            let buttons = document.querySelectorAll("#btn-accept-invite")
            for (const button of buttons) {
                button.onclick = acceptInvite
            }

            buttons = document.querySelectorAll("#btn-decline-invite")
            for (const button of buttons) {
                button.onclick = declineInvite
            }

        }

        function acceptInvite() {
            const inviteId = this.value
            cotaData.answerInvite(inviteId, "accept")
                .then(() => showInvites())
        }

        function declineInvite() {
            const inviteId = this.value
            cotaData.answerInvite(inviteId, "decline")
                .then(() => showInvites())
        }
    }

    function showTvPopular() {
        cotaData.getTvPopular().then(showView)
    
        function showView(rsp) {
            document.querySelector(".topnav").style.display = "block";
            mainContent.innerHTML = templates.tvpopular(rsp.result.results)
        }
    }

    function showTvSearch() {
        const query = document.querySelector("#input-tvsearch").value
        cotaData.getTvSearch(query).then(showView)

        function showView(rsp) {
            const results = {
                searchquery: decodeURIComponent(query), // decode special characters to, like: 日本語
                items: rsp.result.results
            }
            mainContent.innerHTML = templates.tvsearch(results)
        }
    }

    function showGroupList() {
        cotaData.getGroupList().then(showView)
    
        function showView(rsp) {
            if (rsp.error && rsp.error.id==60) {
                showNonAuthenticated()
                return
            }
            mainContent.innerHTML = templates.grouplist(rsp.result)
            document.querySelector("#btn-create-group").onclick = createGroup
        }
        
        function createGroup() {
            let group = { }
            document.querySelectorAll(".data-group input")
                .forEach(input => group[input.id] = input.value)
            cotaData.createGroup(group)
                .then(rsp => rsp.error ? showError(rsp.error) : showGroupList())
        }
    }

    function showGroup(id) {
        cotaData.getGroup(id).then(showView)
    
        function showView(rsp) {
            if (rsp.error && rsp.error.id==60) {
                showNonAuthenticated()
                return
            }
            else {
                mainContent.innerHTML = templates.group(rsp.result)
                
                const seriesContainer = document.querySelector("#series-container")
                seriesContainer.innerHTML = templates.group_series(rsp.result)

                let buttons = document.querySelectorAll("#btn-delete-serie")
                for (const button of buttons) {
                    if(context.user.username != rsp.result.owner) {
                        button.style.display = "none"
                    } else {
                        button.onclick = deleteSerieToGroup
                    }
                }

                const collaboratorsContainer = document.querySelector("#collaborators-container")
                collaboratorsContainer.innerHTML = templates.group_collaborators(rsp.result)

                document.querySelector("#btn-edit-group").onclick = editGroup
                document.querySelector("#btn-series-by-vote").onclick = seriesByVote
                document.querySelector("#btn-invite").onclick = inviteToGroup

                const invitesContainer = document.querySelector("#invites-container")
                invitesContainer.innerHTML = templates.group_invites({invites:rsp.result.invites})
                buttons = document.querySelectorAll("#btn-cancel-invite")
                for (const button of buttons) {
                    button.onclick = cancelInvite
                }

            }
        }

        function editGroup() {
            const groupId = window.location.hash.substring(1).split("/")[1]
            let group = { }
            document.querySelectorAll(".data-group input")
                .forEach(input => group[input.id] = input.value)
            
            cotaData.editGroup(id, group)
                .then(rsp => rsp.error ? showError(rsp.error) : showGroup(groupId))
        }

        function seriesByVote() {
            const group = {
                id: window.location.hash.substring(1).split("/")[1]
            }
            let voteRange = { }
            document.querySelectorAll(".data-seriesbyvote input")
                .forEach(input => voteRange[input.id] = input.value)

            cotaData.getSeriesByVote(group.id, voteRange)
                .then(rsp => rsp.error ? showError(rsp.error) : showSeriesByVote(rsp))
        }

        function inviteToGroup() {
            const group = {
                id: window.location.hash.substring(1).split("/")[1]
            }
            const inviteName = document.querySelector("#invite-name").value

            cotaData.inviteToGroup(group.id, inviteName)
                .then(rsp => rsp.error ? showError(rsp.error) : showGroupInvites(rsp))
        }

        function cancelInvite() {
            console.log("Clicked")
            const group = {
                id: window.location.hash.substring(1).split("/")[1]
            }
            const inviteId = this.value

            cotaData.cancelInvite(group.id, inviteId)
                .then(rsp => rsp.error ? showError(rsp.error) : showGroupInvites(rsp))
        }

        function deleteSerieToGroup() {
            const groupId = window.location.hash.substring(1).split("/")[1]
            const serieId = this.value
            location.hash = `group/${groupId}`
            cotaData.deleteSerieFromGroup(groupId, serieId)
                .then(() => showGroup(groupId))
        }

        function showGroupInvites(rsp) {
            if (rsp.error && rsp.error.id==60) {
                showNonAuthenticated()
                return
            }
            const invitesContainer = document.querySelector("#invites-container")
            invitesContainer.innerHTML = templates.group_invites({invites:rsp.result})
            const buttons = document.querySelectorAll("#btn-cancel-invite")
            for (const button of buttons) {
                button.onclick = cancelInvite
            }
        }
    }

    function showSerieAddGroupList() {
        cotaData.getGroupList().then(showView)
    
        function showView(rsp) {
            if (rsp.error && rsp.error.id==60) {
                showNonAuthenticated()
                return
            }
            mainContent.innerHTML = templates.seriegroupselector(rsp.result)

            const buttons = document.querySelectorAll("#btn-add-serie")
            for (const button of buttons) {
                button.onclick = addSerieToGroup
            }
        }
        
        function addSerieToGroup() {
            const groupId = this.value
            const serieId = window.location.hash.substring(1).split("/")[1]
            location.hash = `group/${groupId}`
            cotaData.addSerieToGroup(groupId, serieId)
                .then(() => showGroup(groupId))
        }
    }
    
    function showSeriesByVote(rsp) {
        if (rsp.error && rsp.error.id==60) {
            showNonAuthenticated()
            return
        }
        const seriesContainer = document.querySelector("#series-container")
        seriesContainer.innerHTML = templates.group_seriesbyvote({series:rsp.result})
    }

    function showNonAuthenticated() {    
        mainContent.innerHTML = templates.nonauthenticated()
    }

    function showError(error) {
        mainContent.innerHTML = templates.notfound(error)
    }
}