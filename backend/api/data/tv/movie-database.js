
const debug = require('debug')('cota:movie-database')

module.exports = function (_fetch) {
    const fetch = _fetch
    const movieDbKey = process.env.MOVIE_DB_KEY

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
        return `http://api.themoviedb.org/3${path}?${encodeURI(urlParams)}api_key=${movieDbKey}`
    }

    function makeRequest(url, options) {
        debug(`requesting: ${url}`)
        return fetch(url, options)
            .then(rsp => rsp.json())
    }
}