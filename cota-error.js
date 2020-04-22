
const errorList = require('./json_files/COTA_ERROR')

module.exports = function () {
    return {
        get              : get,
        toHttpStatusCode : toHttpStatusCode
    }

    function get(id) {
        return errorList.list.find(i => i.id == id)
    }

    function toHttpStatusCode(error) {
        let errorId = error.id;
        if (errorId >= 10 && errorId < 20) {
            return 404
        }
        if (errorId >= 20 && errorId < 30) {
            return 400
        }
        if (errorId >= 40 && errorId < 50) {
            return 422
        }
        return 500;
    }
}