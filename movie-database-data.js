
const debug = require('debug')('cota:movie-database-data')

module.exports = function (_fetch, MOVIE_DB_KEY = './json_files/MOVIE_DB_KEY') {
    const fetch = _fetch
    const movieDbKey = require(MOVIE_DB_KEY)

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
        const url = buildUrl(`/tv/${seriesId}`)
        return makeRequest(url)
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