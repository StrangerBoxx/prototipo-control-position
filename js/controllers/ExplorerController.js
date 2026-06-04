class ExplorerController {
    constructor(apiModel, explorerView, dashboardView) {
        this.apiModel = apiModel;
        this.explorerView = explorerView;
        this.dashboardView = dashboardView;
    }

    init() {
        this.dashboardView.setContent(this.explorerView.getHTML());
        this.explorerView.bindEvents();

        this.explorerView.onQuery((path) => this._query(path));

        this.explorerView.onTagClick((path, tagEl) => {
            this.explorerView.setPathValue(path);
            this.explorerView.setActiveTag(path);
            this._query(path);
        });
    }

    async _query(path) {
        this.explorerView.setLoading(true);
        try {
            const data = await this.apiModel.query(path);
            this.explorerView.setLoading(false);
            this.explorerView.renderResult(data, path);
        } catch (err) {
            this.explorerView.setLoading(false);
            this.explorerView.renderError(err.message);
        }
    }
}
