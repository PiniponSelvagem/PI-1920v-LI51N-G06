module.exports = function(states, defaultState) {
    window.onhashchange = stateChanged
    document.querySelector("#btn-tvsearch").onclick = searchTvShowAction

    stateChanged()

    function stateChanged() {
        let stateData = window.location.hash.substring(1).split("/")

        let [state, ...stateArgs] = stateData
        // Equivalent conde to the previous line
        // let state = stateData.shift()
        // let stateArgs = stateData 


        let stateObj = states[state]
        if (!stateObj) {
            window.location.hash = defaultState
            return
        }
        
        //stateObj.script.apply(null, stateArgs)
        stateObj(...stateArgs)
    }

    function searchTvShowAction() {
        location.hash = "tvsearch"
        stateChanged()
    }
}