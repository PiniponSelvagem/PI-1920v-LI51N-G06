module.exports = function(cotaData, context) {
    const mainContent = document.querySelector("#main-content")
    const userInfoNavBar = document.querySelector("#user-info")
    const templates = require('./templates')

    Promise.resolve(context.user).then(showCurrentUserInfo)

    return states = {
        login  : login,
        logout : logout
    }

    function showCurrentUserInfo(username) {
        if (username) {
            userInfoNavBar.innerHTML = templates.user_loggedin(username)
            document.querySelector("#btn-navbar-logout").onclick = goToLogout
        }
        else {
            userInfoNavBar.innerHTML = templates.user_loggedout()
            document.querySelector("#btn-navbar-login").onclick = goToLogin
        }

        function goToLogin() {
            location.hash = "login"
        }

        function goToLogout() {
            location.hash = "logout"
        }
    }

    function login() {
        mainContent.innerHTML = templates.login()
        document.querySelector("#topnav").style.display = "none";

        document.querySelector("#btn-auth-login").onclick = doLogin
        document.querySelector("#btn-auth-register").onclick = doRegister

        function doLogin() {
            const username = document.querySelector("#username").value
            const password = document.querySelector("#password").value

            cotaData.login(username, password)
                .then(processLogin)

            function processLogin(loginStatus) {
                context.user = { username: loginStatus.username }
                if (loginStatus.ok) {
                    Promise.resolve(context.user).then(showCurrentUserInfo)
                    document.querySelector("#topnav").style.display = "block";
                    location.hash = "tvpopular"
                }
            }
        }

        function doRegister() {
            const username = document.querySelector("#username").value
            const password = document.querySelector("#password").value

            cotaData.register(username, password)
                .then(processRegister)

            function processRegister(registerStatus) {
                if (registerStatus.ok) {
                    console.log("TODO: AUTH-CONTROLLER::LOGIN::doRegister")
                    doLogin()
                    /*
                    cotaData.currentUser().then(showCurrentUserInfo)
                    document.querySelector("#user-info").style.display = "block";
                    location.hash = "tvpopular"
                    */
                }
            }
        }
    }

    function logout() {
        cotaData.logout()
            .then(processLogout)

        function processLogout() {
            context.user = undefined
            showCurrentUserInfo(context.user)
            location.hash = "tvpopular"
        }
    }
}