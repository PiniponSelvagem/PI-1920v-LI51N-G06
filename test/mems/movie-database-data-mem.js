const debug = require('debug')('cota:movie-database-data')

module.exports = function (dbFile) {

    return {
        getTvPopular      : getTvPopular,
        getTvSearch       : getTvSearch,
        getTvSeriesWithID : getTvSeriesWithID
    }

    function getTvPopular() {
        const url = buildUrl('/tv/popular')
        return makeRequest(url)
    }

    function getTvSearch(params) {
        const url = buildUrl('/search/tv', params)
        return makeRequest(url)
    }

    function getTvSeriesWithID(seriesId) {
        return Promise.resolve(dbFile.find( series => series.id === seriesId))
    }


    ///////////////////
    // AUX functions //
    ///////////////////
    function buildUrl(path, params) {
        let urlParams = ''
        for(let k in params) {
            urlParams += `${k}=${params[k]}&`
        }

        // encodeURI -> supporting special chars, like spaces, あ, á...
        return `http://api.themoviedb.org/3${path}?${encodeURI(urlParams)}api_key=${movieDbKey.key}`
    }

    function makeRequest(url, options) {
        debug(`requesting: ${url}`)
        return fetch(url, options)
            .then(rsp => rsp.json())
    }
}