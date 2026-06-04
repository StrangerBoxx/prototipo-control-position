class AuthController {
    constructor(userModel, loginView, dashboardView, explorerController, routesController) {
        this.userModel = userModel;
        this.loginView = loginView;
        this.dashboardView = dashboardView;
        this.explorerController = explorerController;
        this.routesController = routesController;
    }

    init() {
        this.userModel.email = 'Dev';
        this.userModel.isAuthenticated = true;
        this._showDashboard();
    }

    _showLogin() {
        this.loginView.render();
        this.loginView.bindSubmit((email, password) => {
            if (this.userModel.login(email, password)) {
                this._showDashboard();
            } else {
                this.loginView.showError('Credenciales inválidas. Intente nuevamente.');
            }
        });
    }

    _showDashboard() {
        this.dashboardView.render(this.userModel.getEmail());
        this.dashboardView.bindLogout(() => {
            this.userModel.logout();
            this._showLogin();
        });
        this.dashboardView.bindNavigation({
            explorer: () => this.explorerController.init(),
            routes:   () => this.routesController.init()
        });
        this.explorerController.init();
    }
}
