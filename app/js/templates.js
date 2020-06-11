const Handlebars = require('handlebars')

module.exports = {
    notfound           : Handlebars.compile(require('../templates/notfound.hbs').default),
    tvpopular          : Handlebars.compile(require('../templates/tvpopular.hbs').default),
    tvsearch           : Handlebars.compile(require('../templates/tvsearch.hbs').default),
    grouplist          : Handlebars.compile(require('../templates/grouplist.hbs').default),
    group              : Handlebars.compile(require('../templates/group.hbs').default),
    seriegroupselector : Handlebars.compile(require('../templates/seriegroupselector.hbs').default),
    group_series       : Handlebars.compile(require('../templates/group_series.hbs').default),
    group_seriesbyvote : Handlebars.compile(require('../templates/group_seriesbyvote.hbs').default)
}