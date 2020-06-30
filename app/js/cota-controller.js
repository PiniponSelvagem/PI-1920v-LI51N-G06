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
    
        function showView(rsp) {
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
                const table = document.querySelector("#series-content")
                table.innerHTML = templates.group_series(rsp.result)

                document.querySelector("#btn-edit-group").onclick = editGroup
                document.querySelector("#btn-series-by-vote").onclick = seriesByVote

                const delButtons = document.querySelectorAll("#btn-delete-serie")
                for (const button of delButtons) {
                    button.onclick = deleteSerieToGroup
                }
                const scoreData = document.querySelectorAll("#btn-score-serie")
                for (const data of scoreData) {
                    data.onclick = addScoreToSeries
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

        function deleteSerieToGroup() {
            const groupId = window.location.hash.substring(1).split("/")[1]
            const serieId = this.value
            location.hash = `group/${groupId}`
            cotaData.deleteSerieFromGroup(groupId, serieId)
                .then(() => showGroup(groupId))
        }

        function addScoreToSeries() {
            const groupId = window.location.hash.substring(1).split("/")[1]
            const serieId = this.value
            location.hash = `group/${groupId}`
            let score = []
            document.querySelectorAll(".data-score input")
                .forEach(input => score.push(input.value))

            console.log(serieId)
            cotaData.addScoreToSerie(groupId, serieId, score[0])

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
        const table = document.querySelector("#series-content")
        table.innerHTML = templates.group_seriesbyvote({series:rsp.result})
    }

    function showNonAuthenticated() {    
        mainContent.innerHTML = templates.nonauthenticated()
    }

    function showError(error) {
        mainContent.innerHTML = templates.notfound(error)
    }
}