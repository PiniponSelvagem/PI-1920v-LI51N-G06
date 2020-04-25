
const debug = require('debug')('cota:movie-database-data')

module.exports = function (_request, MOVIE_DB_KEY = './json_files/MOVIE_DB_KEY') {
    const request = _request
    const movieDbKey = require(MOVIE_DB_KEY)

    return {
        getTvPopular     : getTvPopular,
        getTvSearch      : getTvSearch,
        getTvSerieWithID : getTvSerieWithID,
        //getSeriesByVote  : getSeriesByVote
    }

    function getTvPopular(cb) {
        const options = buildRequestOptions('/tv/popular')
        debug(`requesting: ${options.url}`)
        request(options, function(err, res, body) {
            cb(null, JSON.parse(body))
        });
    }

    function getTvSearch(params, cb) {
        const options = buildRequestOptions('/search/tv', params)
        debug(params)
        debug(`requesting: ${options.url}`)
        request(options, function(err, res, body) {
            cb(null, JSON.parse(body))
        });
    }

    function getTvSerieWithID(serieId, cbSerie, cb) {
        const options = buildRequestOptions(`/tv/${serieId}`)
        debug(`requesting: ${options.url}`)
        request(options, function(err, res, body) {
            cbSerie(JSON.parse(body), cb)
        });
    }

    /*
    function getSeriesByVote(seriesIds) {
        let series = []
        let i = 0
        for (let k in seriesIds) {
            const serieId = seriesIds[k].id
            const options = buildRequestOptions(`/tv/${serieId}`)
            debug(`requesting: ${options.url}`)
            request(options, function(err, res, body) {
                const serie = JSON.parse(body)
                cb(getSerieVote(serie.id, serie.vote_average))
            });

            function getSerieVote(serieId, vote) {
                return { id: serieId, vote_average: vote }
            }
        }

        cb(series)
    }
    */


    ///////////////////
    // AUX functions //
    ///////////////////
    function buildRequestOptions(path, params) {
        let urlParams = ''
        for(let k in params) {
            urlParams += `${k}=${params[k]}&`
        }
        
        return {    // encodeURI -> supporting special chars, like spaces, あ, á...
            url: `http://api.themoviedb.org/3${path}?${encodeURI(urlParams)}api_key=${movieDbKey.key}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };
    }
}