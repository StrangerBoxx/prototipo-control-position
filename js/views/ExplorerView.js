class ExplorerView {
    constructor() {
        this._queryHandler = null;
        this._tagHandler = null;
    }

    getHTML() {
        return `
            <div class="page-header">
                <div class="page-header-content">
                    <span class="page-header-back" id="back-btn" title="Volver">
                        <svg viewBox="64 64 896 896" fill="currentColor" width="16" height="16">
                            <path d="M872 474H286.9l350.2-304c5.6-4.9 2.2-14-5.2-14h-88.5c-3.9 0-7.6 1.4-10.5 3.9L155 487.8a31.96 31.96 0 000 48.3L535.1 866c1.5 1.3 3.3 2 5.2 2h91.5c7.4 0 10.8-9.2 5.2-14L286.9 550H872c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"/>
                        </svg>
                    </span>
                    <span class="page-header-title">Bsale Explorer</span>
                    <span class="page-header-subtitle">Consulta endpoints de guías de despacho y tipos de documentos</span>
                </div>
            </div>
            <hr class="divider">
            <div class="form-row">
                <label class="form-label">Path</label>
                <div class="form-control">
                    <div class="path-input-group">
                        <input
                            type="text"
                            id="path-input"
                            class="path-input"
                            placeholder="/v1/shippings.json?limit=25&offset=0"
                        >
                        <button id="consult-btn" class="btn-consult">
                            <svg viewBox="64 64 896 896" fill="currentColor">
                                <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"/>
                            </svg>
                            Consultar
                        </button>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <label class="form-label">Endpoints</label>
                <div class="form-control">
                    <div class="tags-container" id="tags-container">
                        <span class="endpoint-tag" data-path="/v1/shippings.json?limit=25&offset=0">/v1/shippings.json?limit=25&amp;offset=0</span>
                        <span class="endpoint-tag" data-path="/v1/document_types.json?limit=25&offset=0&state=0">/v1/document_types.json?limit=25&amp;offset=0&amp;state=0</span>
                        <span class="endpoint-tag" data-path="/v1/shippings/1.json">/v1/shippings/{id}.json</span>
                        <span class="endpoint-tag" data-path="/v1/shippings/1/details.json">/v1/shippings/{id}/details.json</span>
                        <span class="endpoint-tag" data-path="/v1/shippings/1/details/1.json">/v1/shippings/{id}/details/{detailId}.json</span>
                        <span class="endpoint-tag" data-path="/v1/document_types/1.json">/v1/document_types/{id}.json</span>
                        <span class="endpoint-tag" data-path="/v1/offices/1.json">/v1/offices/{id}.json</span>
                        <span class="endpoint-tag" data-path="/v1/shipping_types/1.json">/v1/shipping_types/{id}.json</span>
                        <span class="endpoint-tag" data-path="/v1/variants/101.json">/v1/variants/{id}.json</span>
                    </div>
                </div>
            </div>
            <hr class="divider">
            <div id="result-section"></div>
        `;
    }

    bindEvents() {
        const consultBtn = document.getElementById('consult-btn');
        const pathInput = document.getElementById('path-input');
        const tagsContainer = document.getElementById('tags-container');

        consultBtn && consultBtn.addEventListener('click', () => {
            const path = pathInput.value.trim();
            if (path && this._queryHandler) this._queryHandler(path);
        });

        pathInput && pathInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const path = pathInput.value.trim();
                if (path && this._queryHandler) this._queryHandler(path);
            }
        });

        tagsContainer && tagsContainer.addEventListener('click', (e) => {
            const tag = e.target.closest('.endpoint-tag');
            if (tag && this._tagHandler) {
                this._tagHandler(tag.dataset.path, tag);
            }
        });
    }

    onQuery(handler) { this._queryHandler = handler; }
    onTagClick(handler) { this._tagHandler = handler; }

    setPathValue(path) {
        const input = document.getElementById('path-input');
        if (input) input.value = path;
    }

    setActiveTag(activePath) {
        document.querySelectorAll('.endpoint-tag').forEach(tag => {
            tag.classList.toggle('active', tag.dataset.path === activePath);
        });
    }

    setLoading(isLoading) {
        const btn = document.getElementById('consult-btn');
        if (btn) btn.disabled = isLoading;
        if (isLoading) {
            const result = document.getElementById('result-section');
            if (result) result.innerHTML = `<div class="loading-overlay"><div class="spinner"></div></div>`;
        }
    }

    renderResult(data, path) {
        const result = document.getElementById('result-section');
        if (!result) return;
        result.innerHTML = `
            <div class="result-label">Respuesta &mdash; <code style="font-size:11px;color:#356CA9">${path || ''}</code></div>
            <pre class="json-result">${JSON.stringify(data, null, 2)}</pre>
        `;
    }

    renderError(message) {
        const result = document.getElementById('result-section');
        if (result) {
            result.innerHTML = `<div class="error-msg" style="display:block;font-size:14px;">${message}</div>`;
        }
    }
}
