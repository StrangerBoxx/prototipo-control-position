document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app');

    const userModel = new UserModel();
    const apiModel  = new ApiModel();

    const loginView     = new LoginView(container);
    const dashboardView = new DashboardView(container);
    const explorerView  = new ExplorerView();
    const routesView    = new RoutesView();

    const explorerController = new ExplorerController(apiModel, explorerView, dashboardView);
    const routesController   = new RoutesController(routesView, dashboardView, apiModel);
    const authController     = new AuthController(userModel, loginView, dashboardView, explorerController, routesController);

    authController.init();
});
