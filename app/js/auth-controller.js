module.exports = function(cotaData, templates, context) {
    const mainContent = document.querySelector("#main-content")
    const userInfoNavBar = document.querySelector("#user-info")
    
    
    // In case session is valid, but user refreshed the page. Show user name at user info.
    cotaData.getCurrentUser()
        .then(status => { 
            context.user = status.result
            return context.user
        })
        .then(showCurrentUserInfo)

    return states = {
        login  : login,
        logout : logout
    }

    function showCurrentUserInfo(user) {
        if (user) {
            userInfoNavBar.innerHTML = templates.user_loggedin(user)
            document.querySelector("#btn-navbar-logout").onclick = goToLogout
            document.querySelector("#group-list-button").style.display = "block";
        }
        else {
            userInfoNavBar.innerHTML = templates.user_loggedout()
            document.querySelector("#btn-navbar-login").onclick = goToLogin
            document.querySelector("#group-list-button").style.display = "none"
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
        document.querySelector(".topnav").style.display = "none";
        const errorMsg = document.querySelector("#error-message")

        document.querySelector("#btn-auth-login").onclick = doLogin
        document.querySelector("#btn-auth-register").onclick = doRegister

        function doLogin() {
            const username = document.querySelector("#username").value
            const password = document.querySelector("#password").value

            cotaData.login(username, password)
                .then(processLogin)

            function processLogin(status) {
                if(status.error) {
                    errorMsg.textContent = status.error.message
                    return
                }
                context.user = status.result
                showCurrentUserInfo(context.user)
                document.querySelector(".topnav").style.display = "block";
                location.hash = "tvpopular"
            }
        }

        function doRegister() {
            const username = document.querySelector("#username").value
            const password = document.querySelector("#password").value

            cotaData.register(username, password)
                .then(processRegister)

            function processRegister(status) {
                if (status.error) {
                    errorMsg.textContent = status.error.message
                    return
                }
                doLogin()
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