const Handlebars = require('handlebars')

module.exports = {
    notfound           : Handlebars.compile(require('../templates/notfound.hbs').default),
    tvpopular          : Handlebars.compile(require('../templates/tvpopular.hbs').default),
    tvsearch           : Handlebars.compile(require('../templates/tvsearch.hbs').default),
    grouplist          : Handlebars.compile(require('../templates/grouplist.hbs').default),
    group              : Handlebars.compile(require('../templates/group.hbs').default),
    seriegroupselector : Handlebars.compile(require('../templates/seriegroupselector.hbs').default),
    group_series       : Handlebars.compile(require('../templates/group_series.hbs').default),
    group_seriesbyvote : Handlebars.compile(require('../templates/group_seriesbyvote.hbs').default),
    group_invites      : Handlebars.compile(require('../templates/group_invites.hbs').default),
    invites            : Handlebars.compile(require('../templates/invites.hbs').default),
    group_collaborators: Handlebars.compile(require('../templates/group_collaborators.hbs').default),

    login              : Handlebars.compile(require('../templates/login.hbs').default),

    user_loggedin      : Handlebars.compile(require('../templates/user_logged-in.hbs').default),
    user_loggedout     : Handlebars.compile(require('../templates/user_logged-out.hbs').default),

    nonauthenticated   : Handlebars.compile(require('../templates/nonauthenticated.hbs').default)
}