module.exports = function(cotaData, templates, context) {
    const mainContent = document.querySelector("#main-content")

    return states = {
        tvpopular          : showTvPopular,
        tvsearch           : showTvSearch,
        grouplist          : showGroupList,
        group              : showGroup,
        seriegroupselector : showSerieAddGroupList,
        nonauthenticated   : showNonAuthenticated
    }

    function showTvPopular() {
        cotaData.getTvPopular().then(showView)
    
        function showView(items) {
            mainContent.innerHTML = templates.tvpopular(items.results)
        }
    }

    function showTvSearch() {
        const query = document.querySelector("#input-tvsearch").value
        cotaData.getTvSearch(query).then(showView)

        function showView(items) {
            const results = {
                searchquery: decodeURIComponent(query), // decode special characters to, like: 日本語
                items: items.results
            }
            mainContent.innerHTML = templates.tvsearch(results)
        }
    }

    function showGroupList() {
        cotaData.getGroupList().then(showView)
    
        function showView(items) {
            if (items.message && items.id==60) {
                showNonAuthenticated()
                return
            }
            mainContent.innerHTML = templates.grouplist(items)
            document.querySelector("#btn-create-group").onclick = createGroup
        }
        
        function createGroup() {
            let group = { }
            document.querySelectorAll(".data-group input")
                .forEach(input => group[input.id] = input.value)
            cotaData.createGroup(group)
                .then(group => group.message ? showError(group) : showGroupList())
        }
    }

    function showGroup(id) {
        cotaData.getGroup(id).then(showView)
    
        function showView(items) {
            if (items.message && items.id==60) {
                showNonAuthenticated()
                return
            }
            else {
                mainContent.innerHTML = templates.group(items)
                const table = document.querySelector("#series-content")
                table.innerHTML = templates.group_series(items)

                document.querySelector("#btn-edit-group").onclick = editGroup
                document.querySelector("#btn-series-by-vote").onclick = seriesByVote

                const buttons = document.querySelectorAll("#btn-delete-serie")
                for (const button of buttons) {
                    button.onclick = deleteSerieToGroup
                }
            }
        }

        function editGroup() {
            const groupId = window.location.hash.substring(1).split("/")[1]
            let group = { }
            document.querySelectorAll(".data-group input")
                .forEach(input => group[input.id] = input.value)
            
            cotaData.editGroup(id, group)
                .then(group => group.message ? showError(group) : showGroup(groupId))
        }

        function seriesByVote() {
            const group = {
                id: window.location.hash.substring(1).split("/")[1]
            }
            let voteRange = { }
            document.querySelectorAll(".data-seriesbyvote input")
                .forEach(input => voteRange[input.id] = input.value)

            cotaData.getSeriesByVote(group.id, voteRange)
                .then(series => series.message ? showError(series) : showSeriesByVote({group, series}))
        }

        function deleteSerieToGroup() {
            const groupId = window.location.hash.substring(1).split("/")[1]
            const serieId = this.value
            location.hash = `group/${groupId}`
            cotaData.deleteSerieFromGroup(groupId, serieId)
                .then(() => showGroup(groupId))
        }
    }

    function showSerieAddGroupList() {
        cotaData.getGroupList().then(showView)
    
        function showView(items) {
            if (items.message && items.id==60) {
                showNonAuthenticated()
                return
            }
            mainContent.innerHTML = templates.seriegroupselector(items)

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
    
    function showSeriesByVote(groupInfo) {
        if (items.message && items.id==60) {
            showNonAuthenticated()
            return
        }
        const table = document.querySelector("#series-content")
        table.innerHTML = templates.group_seriesbyvote(groupInfo)
    }

    function showNonAuthenticated() {    
        mainContent.innerHTML = templates.nonauthenticated()
    }

    function showError(error) {
        mainContent.innerHTML = templates.notfound(error)
    }
}