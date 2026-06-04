class RoutesView {
    constructor() {
        this._shipments      = [];
        this._selectedLocIdx = 0;
        this._isLiveMode     = false;
        this._liveTechs      = null;
        this._locations      = [
            {
                tag:     'Base central',
                name:    'Control Position SPA',
                address: '3 Pte. 103, 2520272 Valparaíso, Viña del Mar, Valparaíso',
                lat:     -33.0372,
                lng:     -71.5513
            }
        ];
        this._editMode            = false;
        this._currentTechs        = null;
        this._selectedTechIds     = null; // null = all selected
        this._addTechHandler      = null;
        this._removeTechHandler   = null;
        this._assignShipHandler   = null;
        this._autoAssignHandler   = null;
        this._moveStopHandler     = null;
        this._reorderStopHandler  = null;
        this._removeStopHandler   = null;
        this._optimizeTechHandler = null;
        this._savePlanHandler     = null;
        this._loadPlanHandler     = null;
        this._exitLiveHandler     = null;
        this._toggleDoneHandler   = null;
        this._analyzeOTHandler    = null;
        this._confirmHandler      = null;
        this._reassignHandler     = null;
        this._discardHandler      = null;
    }

    getHTML() {
        return `
            <div class="page-header">
                <div class="page-header-content routes-page-header-content">
                    <div>
                        <span class="page-header-title">Optimizador de Rutas</span>
                        <span class="page-header-subtitle">Planifica y gestiona las rutas del equipo técnico</span>
                    </div>
                    <span id="live-mode-badge" class="live-badge" style="display:none">● Jornada en Curso</span>
                </div>
            </div>

            <div id="planning-section">
                <div class="routes-card">
                    <h4 class="routes-section-title">Técnicos</h4>
                    <div id="technicians-container">
                        <p class="routes-empty">Cargando técnicos…</p>
                    </div>
                </div>

                <div class="routes-card">
                    <h4 class="routes-section-title">Ordenes de Trabajo</h4>
                    <div id="shipments-container">
                        <p class="routes-empty">Cargando órdenes…</p>
                    </div>
                    <div class="auto-assign-row">
                        <button id="auto-assign-btn" class="btn-primary btn-auto-assign">✦ Asignar Rutas</button>
                    </div>
                </div>

                <div id="routes-container"></div>

                <div class="routes-card routes-plan-actions">
                    <div class="plan-btn-row">
                        <button id="save-plan-btn" class="btn-primary">Guardar Planificación del Día</button>
                        <button id="edit-routes-btn" class="btn-secondary btn-edit-assign">✎ Editar Asignación</button>
                        <button id="load-plan-btn" class="btn-secondary btn-load">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4l3 3"/></svg>
                            Cargar Plan → Modo Reactivo
                        </button>
                    </div>
                </div>
            </div>

            <div id="live-section" style="display:none">
                <div id="live-banner" class="live-banner"></div>

                <div class="routes-card">
                    <div class="live-routes-header">
                        <h4 class="routes-section-title" style="margin:0">Estado de Rutas</h4>
                        <button id="live-edit-routes-btn" class="btn-secondary btn-edit-assign btn-sm">✎ Editar Rutas</button>
                    </div>
                    <div id="live-routes-container"></div>
                </div>

                <div class="routes-card">
                    <h4 class="routes-section-title">Nueva Orden de Trabajo</h4>
                    <p class="routes-section-note">Selecciona un envío pendiente para obtener una sugerencia de asignación basada en el estado actual de las rutas.</p>
                    <div id="new-ot-section"></div>
                </div>

                <div id="suggestion-card" class="routes-card suggestion-card" style="display:none">
                    <div id="suggestion-content"></div>
                </div>
            </div>

            <div id="toast-container" class="toast-container"></div>
        `;
    }

    bindEvents() {
        this._shipments      = [];
        this._selectedLocIdx = 0;
        this._isLiveMode     = false;
        this._liveTechs      = null;
        this._bindPlanButtons();
    }

    onAddTechnician(h)     { this._addTechHandler      = h; }
    onRemoveTechnician(h)  { this._removeTechHandler   = h; }
    onAssignShipment(h)    { this._assignShipHandler   = h; }
    onAutoAssign(h)        { this._autoAssignHandler   = h; }
    onMoveStop(h)          { this._moveStopHandler     = h; }
    onReorderStop(h)       { this._reorderStopHandler  = h; }
    onRemoveStop(h)        { this._removeStopHandler   = h; }
    onOptimizeTech(h)      { this._optimizeTechHandler = h; }
    onSavePlan(h)          { this._savePlanHandler     = h; }
    onLoadPlan(h)          { this._loadPlanHandler     = h; }
    onExitLiveMode(h)      { this._exitLiveHandler     = h; }
    onToggleCompleted(h)   { this._toggleDoneHandler   = h; }
    onAnalyzeNewOT(h)      { this._analyzeOTHandler    = h; }
    onConfirmSuggestion(h) { this._confirmHandler      = h; }
    onReassignOT(h)        { this._reassignHandler     = h; }
    onDiscardOT(h)         { this._discardHandler      = h; }

    setShipments(shipments) {
        this._shipments = shipments.map(s => ({ ...s, _added: false }));
        this._renderShipments([]);
    }

    setError(msg) {
        const el = document.getElementById('shipments-container');
        if (el) el.innerHTML = `<p class="routes-empty">${msg}</p>`;
    }

    markShipmentAdded(idx)     { if (this._shipments[idx]) this._shipments[idx]._added = true; }
    markShipmentAvailable(idx) { if (this._shipments[idx]) this._shipments[idx]._added = false; }
    getShipment(idx)           { return this._shipments[idx] || null; }
    getUnassignedShipments()   { return this._shipments.map((s, i) => ({ ship: s, idx: i })).filter(({ ship }) => !ship._added); }
    getSelectedLocation()      { return this._locations[this._selectedLocIdx] || null; }

    refreshShipments(techs) {
        this._renderShipments(techs || []);
    }

    // ── Técnicos: dropdown con checkboxes ──────────────────────────────────
    renderTechnicians(techs) {
        const el = document.getElementById('technicians-container');
        if (!el) return;
        if (techs.length === 0) {
            el.innerHTML = '<p class="routes-empty">No hay técnicos disponibles.</p>';
            return;
        }

        // Init selected state: all selected if not set
        if (!this._selectedTechIds) {
            this._selectedTechIds = new Set(techs.map(t => t.id));
        }

        const selectedCount = this._selectedTechIds.size;
        const totalCount    = techs.length;
        const label = selectedCount === totalCount
            ? `${totalCount} de ${totalCount} técnicos seleccionados`
            : `${selectedCount} de ${totalCount} técnico${totalCount !== 1 ? 's' : ''} seleccionado${selectedCount !== 1 ? 's' : ''}`;

        el.innerHTML = `
            <div class="tech-dropdown" id="tech-dropdown">
                <button class="tech-dropdown-trigger" id="tech-dropdown-btn" type="button">
                    <span class="tech-dropdown-label">${label}</span>
                    <svg class="tech-dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div class="tech-dropdown-menu" id="tech-dropdown-menu" style="display:none">
                    <div class="tech-dropdown-item tech-dropdown-all" id="tech-select-all-row">
                        <span class="tech-check-icon tech-check-all-icon" id="tech-check-all">
                            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2" fill="#3b82f6"/><path d="M4 8l3 3 5-5" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </span>
                        <span class="tech-dropdown-all-text">SELECCIONAR TODOS</span>
                    </div>
                    ${techs.map(t => `
                        <div class="tech-dropdown-item" data-tech-id="${t.id}">
                            <span class="tech-check-icon" data-check="${t.id}">
                                ${this._selectedTechIds.has(t.id)
                                    ? `<svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2" fill="#3b82f6"/><path d="M4 8l3 3 5-5" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                                    : `<svg viewBox="0 0 16 16" width="12" height="12"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="#d1d5db" stroke-width="1.5"/></svg>`}
                            </span>
                            <div class="tech-dropdown-info">
                                <span class="tech-dropdown-name">${t.name}</span>
                                <span class="tech-dropdown-location">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                                    ${t.location}${t.location !== t.name && t.location !== 'Santiago' ? '' : t.id === 'tech_2' ? ' · trabaja en Santiago' : ''}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Toggle dropdown
        const btn  = el.querySelector('#tech-dropdown-btn');
        const menu = el.querySelector('#tech-dropdown-menu');
        btn.addEventListener('click', () => {
            const open = menu.style.display !== 'none';
            menu.style.display = open ? 'none' : '';
            btn.querySelector('.tech-dropdown-arrow').style.transform = open ? '' : 'rotate(180deg)';
        });

        // Close on outside click
        document.addEventListener('click', function closeMenu(e) {
            const dropdown = document.getElementById('tech-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                menu.style.display = 'none';
                btn.querySelector('.tech-dropdown-arrow').style.transform = '';
                document.removeEventListener('click', closeMenu);
            }
        });

        // Select all
        el.querySelector('#tech-select-all-row').addEventListener('click', () => {
            const allSelected = this._selectedTechIds.size === techs.length;
            if (allSelected) {
                this._selectedTechIds.clear();
            } else {
                techs.forEach(t => this._selectedTechIds.add(t.id));
            }
            this.renderTechnicians(techs);
            // Keep menu open
            setTimeout(() => {
                const m2 = document.getElementById('tech-dropdown-menu');
                if (m2) m2.style.display = '';
            }, 10);
        });

        // Individual checkboxes
        el.querySelectorAll('.tech-dropdown-item[data-tech-id]').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.techId;
                if (this._selectedTechIds.has(id)) {
                    this._selectedTechIds.delete(id);
                } else {
                    this._selectedTechIds.add(id);
                }
                this.renderTechnicians(techs);
                setTimeout(() => {
                    const m2 = document.getElementById('tech-dropdown-menu');
                    if (m2) m2.style.display = '';
                }, 10);
            });
        });
    }

    renderAllRoutes(techs) {
        this._currentTechs = techs;
        if (this._isLiveMode) {
            this._liveTechs = techs;
            this.updateRouteProgress(techs);
            return;
        }
        const el = document.getElementById('routes-container');
        if (!el) return;
        if (techs.length === 0) { el.innerHTML = ''; return; }
        el.innerHTML = techs.map(tech => this._buildRouteCard(tech)).join('');
        techs.forEach(tech => this._bindRouteCardEvents(tech));
    }

    exitLiveMode(techs) {
        this._isLiveMode = false;
        this._liveTechs  = null;
        this._editMode   = false;
        const editBtn = document.getElementById('edit-routes-btn');
        if (editBtn) { editBtn.textContent = '✎ Editar Asignación'; editBtn.classList.remove('btn-edit--active'); }
        const planSec = document.getElementById('planning-section');
        const liveSec = document.getElementById('live-section');
        const badge   = document.getElementById('live-mode-badge');
        if (planSec) planSec.style.display = '';
        if (liveSec) liveSec.style.display = 'none';
        if (badge)   badge.style.display   = 'none';
        this.renderTechnicians(techs);
        this.renderAllRoutes(techs);
        this._renderShipments(techs);
    }

    enterLiveMode(plan, techs) {
        this._isLiveMode = true;
        this._liveTechs  = techs;

        this._shipments.forEach(s => s._added = false);
        techs.forEach(tech => {
            tech.stops.forEach(stop => {
                if (stop._shipIdx !== undefined && this._shipments[stop._shipIdx]) {
                    this._shipments[stop._shipIdx]._added = true;
                }
            });
        });

        const planSec = document.getElementById('planning-section');
        const liveSec = document.getElementById('live-section');
        const badge   = document.getElementById('live-mode-badge');
        if (planSec) planSec.style.display = 'none';
        if (liveSec) liveSec.style.display = '';
        if (badge)   badge.style.display   = '';

        const banner = document.getElementById('live-banner');
        if (banner) {
            const dt = new Date(plan.savedAt).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
            banner.innerHTML = `
                <div class="live-banner-content">
                    <div class="live-banner-info">
                        <span class="live-banner-title">Modo Reactivo activo</span>
                        <span class="live-banner-sub">Planificación del ${dt} — Marca las paradas completadas para mantener el estado actualizado</span>
                    </div>
                    <button id="exit-live-btn" class="btn-exit-live">← Volver a Planificación</button>
                </div>
            `;
            document.getElementById('exit-live-btn')
                ?.addEventListener('click', () => this._exitLiveHandler && this._exitLiveHandler());
        }

        this.updateRouteProgress(techs);
        this._renderNewOTForm();

        // Bind live edit button
        setTimeout(() => {
            const liveEditBtn = document.getElementById('live-edit-routes-btn');
            if (liveEditBtn) {
                liveEditBtn.addEventListener('click', () => {
                    this._editMode = !this._editMode;
                    liveEditBtn.textContent = this._editMode ? '✓ Listo' : '✎ Editar Rutas';
                    liveEditBtn.classList.toggle('btn-edit--active', this._editMode);
                    this.updateRouteProgress(this._liveTechs);
                });
            }
        }, 50);
    }

    updateRouteProgress(techs) {
        this._liveTechs = techs;
        const el = document.getElementById('live-routes-container');
        if (!el) return;
        const editing = this._editMode;
        el.innerHTML = techs.map(tech => {
            const stopsHtml = tech.stops.length === 0
                ? `<div class="route-drop-zone route-drop-zone--empty" data-tech-id="${tech.id}"><p class="routes-empty" style="margin:8px 0 0">Sin paradas asignadas.</p></div>`
                : `<ul class="stops-ul live-stops-ul${editing ? ' route-drop-zone' : ''}" data-tech-id="${tech.id}">
                    ${tech.stops.map((stop, i) => `
                        <li class="stop-item${!editing && stop.completed ? ' stop-item--done' : ''}${editing ? ' stop-item--editable' : ''}"
                            ${editing ? `draggable="true" data-tech-id="${tech.id}" data-idx="${i}"` : ''}>
                            ${editing
                                ? `<span class="stop-drag-handle" title="Arrastrar para reasignar">⠿</span>`
                                : `<span class="stop-index">${i + 1}</span>`}
                            <div class="stop-name">
                                <span class="stop-recipient">${stop.city || ''}</span>
                                <span class="stop-address-line">${stop.name}</span>
                                <span class="stop-address-line stop-address-detail">${stop.address || ''}${stop.addressDetail ? ', ' + stop.addressDetail : ''}</span>
                                ${stop.folio ? `<span class="stop-folio-tag">${stop.folio}</span>` : ''}
                            </div>
                            ${!editing ? `
                                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((stop.address || stop.name) + ', ' + (stop.city || ''))}" target="_blank" class="btn-maps-inline">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                                    Maps
                                </a>` : ''}
                            ${editing ? `<button class="stop-remove" data-tech-id="${tech.id}" data-idx="${i}">✕</button>` : ''}
                        </li>
                    `).join('')}
                   </ul>`;
            return `
                <div class="live-tech-card" id="live-route-card-${tech.id}">
                    <div class="live-tech-header">
                        <div class="live-tech-title">
                            <span class="live-tech-dot"></span>
                            <span class="live-tech-name">${tech.name}</span>
                        </div>
                        <span class="live-tech-stops">${tech.stops.length} parada${tech.stops.length !== 1 ? 's' : ''}</span>
                    </div>
                    ${stopsHtml}
                </div>
            `;
        }).join('');

        if (editing) techs.forEach(tech => this._bindLiveEditEvents(tech));
    }

    _bindLiveEditEvents(tech) {
        const card = document.getElementById(`live-route-card-${tech.id}`);
        if (!card) return;

        const clearIndicators = () => card.querySelectorAll('.stop-item--drag-above, .stop-item--drag-below')
            .forEach(el => el.classList.remove('stop-item--drag-above', 'stop-item--drag-below'));

        card.querySelectorAll('.stop-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this._removeStopHandler && this._removeStopHandler(btn.dataset.techId, parseInt(btn.dataset.idx));
            });
        });

        card.querySelectorAll('.stop-item--editable').forEach(item => {
            item.addEventListener('dragstart', e => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/json', JSON.stringify({
                    techId: item.dataset.techId,
                    idx:    parseInt(item.dataset.idx)
                }));
                setTimeout(() => item.classList.add('stop-item--dragging'), 0);
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('stop-item--dragging');
                clearIndicators();
            });
            item.addEventListener('dragover', e => {
                e.preventDefault();
                e.stopPropagation();
                clearIndicators();
                const mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
                item.classList.add(e.clientY < mid ? 'stop-item--drag-above' : 'stop-item--drag-below');
            });
            item.addEventListener('dragleave', e => {
                if (!item.contains(e.relatedTarget))
                    item.classList.remove('stop-item--drag-above', 'stop-item--drag-below');
            });
            item.addEventListener('drop', e => {
                e.preventDefault();
                e.stopPropagation();
                clearIndicators();
                card.querySelectorAll('.route-drop-zone').forEach(z => z.classList.remove('route-drop-zone--over'));
                try {
                    const data     = JSON.parse(e.dataTransfer.getData('application/json'));
                    const hoverIdx = parseInt(item.dataset.idx);
                    const before   = e.clientY < item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
                    if (data.techId === tech.id) {
                        let insertIdx = before ? hoverIdx : hoverIdx + 1;
                        if (data.idx < insertIdx) insertIdx--;
                        if (insertIdx !== data.idx && insertIdx >= 0)
                            this._reorderStopHandler && this._reorderStopHandler(tech.id, data.idx, insertIdx);
                    } else {
                        this._moveStopHandler && this._moveStopHandler(data.techId, data.idx, tech.id);
                    }
                } catch (_) {}
            });
        });

        card.querySelectorAll('.route-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                zone.classList.add('route-drop-zone--over');
            });
            zone.addEventListener('dragleave', e => {
                if (!zone.contains(e.relatedTarget)) zone.classList.remove('route-drop-zone--over');
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('route-drop-zone--over');
                clearIndicators();
                try {
                    const data = JSON.parse(e.dataTransfer.getData('application/json'));
                    if (data.techId !== tech.id)
                        this._moveStopHandler && this._moveStopHandler(data.techId, data.idx, tech.id);
                } catch (_) {}
            });
        });
    }

    clearNewOTForm() {
        this._renderNewOTForm();
    }

    showSuggestion(assignments) {
        const card    = document.getElementById('suggestion-card');
        const content = document.getElementById('suggestion-content');
        if (!card || !content) return;
        content.innerHTML = `
            <div class="suggestion-header">
                <span class="suggestion-icon">✦</span>
                <h4 class="suggestion-title">Sugerencias de Asignación</h4>
            </div>
            <ul class="batch-assignments">
                ${assignments.map(({ ot, tech, reason }) => `
                    <li class="batch-item">
                        <div class="batch-ot">
                            <span class="batch-ot-city">${ot.city}</span>
                            <span class="batch-ot-name">${ot.name}</span>
                            <span class="batch-ot-address">${ot.address || ''}</span>
                            ${ot.folio ? `<span class="batch-ot-folio">${ot.folio}</span>` : ''}
                        </div>
                        <span class="batch-arrow">→</span>
                        <div class="batch-tech">
                            <span class="batch-tech-name">${tech.name}</span>
                            <span class="batch-tech-reason">${reason}</span>
                        </div>
                    </li>
                `).join('')}
            </ul>
            <div class="suggestion-actions">
                <button id="confirm-suggestion-btn" class="btn-primary">✓ Confirmar asignaciones</button>
                <button id="discard-suggestion-btn" class="btn-ghost">Descartar</button>
            </div>
        `;
        card.style.display = '';
        setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
        document.getElementById('confirm-suggestion-btn')
            ?.addEventListener('click', () => this._confirmHandler && this._confirmHandler());
        document.getElementById('discard-suggestion-btn')
            ?.addEventListener('click', () => this._discardHandler && this._discardHandler());
    }

    clearSuggestion() {
        const card = document.getElementById('suggestion-card');
        if (card) card.style.display = 'none';
    }

    showToast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('toast-visible'));
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    _renderLocations() {
        const el = document.getElementById('location-options');
        if (!el) return;
        el.innerHTML = this._locations.map((loc, i) => `
            <div class="location-card ${i === this._selectedLocIdx ? 'selected' : ''}" data-loc-idx="${i}">
                <div class="location-card-radio"></div>
                <div class="location-card-body">
                    <span class="location-card-tag">${loc.tag}</span>
                    <span class="location-card-name">${loc.name}</span>
                    <span class="location-card-address">${loc.address}</span>
                </div>
            </div>
        `).join('');
        el.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', () => {
                this._selectedLocIdx = parseInt(card.dataset.locIdx);
                this._renderLocations();
            });
        });
    }

    _bindPlanButtons() {
        const savePlanBtn = document.getElementById('save-plan-btn');
        const loadPlanBtn = document.getElementById('load-plan-btn');

        savePlanBtn?.addEventListener('click', () => this._savePlanHandler && this._savePlanHandler());
        loadPlanBtn?.addEventListener('click', () => this._loadPlanHandler && this._loadPlanHandler());

        const autoBtn = document.getElementById('auto-assign-btn');
        if (autoBtn) {
            autoBtn.addEventListener('click', () => {
                if (autoBtn.disabled) return;
                autoBtn.disabled = true;
                autoBtn.innerHTML = '<span class="btn-spinner"></span> Asignando…';
                setTimeout(() => {
                    this._autoAssignHandler && this._autoAssignHandler();
                    autoBtn.disabled = false;
                    autoBtn.innerHTML = '✦ Asignar Rutas';
                }, 750);
            });
        }
        const editBtn = document.getElementById('edit-routes-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this._editMode = !this._editMode;
                editBtn.textContent = this._editMode ? '✓ Listo' : '✎ Editar Asignación';
                editBtn.classList.toggle('btn-edit--active', this._editMode);
                if (this._currentTechs) this.renderAllRoutes(this._currentTechs);
            });
        }
    }

    // ── Shipments list with folio, patent, phone, meter ───────────────────
    _renderShipments(_techs) {
        const el = document.getElementById('shipments-container');
        if (!el) return;
        const available = this._shipments.filter(s => !s._added);
        if (available.length === 0) {
            el.innerHTML = '<p class="routes-empty">Todas las órdenes han sido asignadas.</p>';
            return;
        }
        el.innerHTML = `
            <ul class="shipments-ul">
                ${available.map(s => `
                    <li class="shipment-item">
                        <div class="shipment-info">
                            <span class="shipment-address">${s.city}</span>
                            <span class="shipment-recipient">${s.recipient}</span>
                            <span class="shipment-detail-address">${s.address}${s.addressDetail ? ', ' + s.addressDetail : ''}</span>
                            <div class="shipment-tags">
                                ${s.folio  ? `<span class="shipment-tag shipment-tag--folio"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> ${s.folio}</span>` : ''}
                                ${s.patent ? `<span class="shipment-tag shipment-tag--patent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h2l3 3v5h-5V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> ${s.patent}</span>` : ''}
                                ${s.phone  ? `<span class="shipment-tag shipment-tag--phone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.11h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6 6l.85-.85a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16l.42.92z"/></svg> ${s.phone}</span>` : ''}
                                ${s.meter  ? `<span class="shipment-tag shipment-tag--meter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> ${s.meter}</span>` : ''}
                            </div>
                            ${s.timeWindowStart ? `<span class="shipment-timewindow">⏱ ${s.timeWindowStart} – ${s.timeWindowEnd}</span>` : ''}
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // ── Route card with Maps button and full address ───────────────────────
    _buildRouteCard(tech) {
        const editing   = this._editMode;
        const stopsHtml = tech.stops.length === 0
            ? `<div class="route-drop-zone route-drop-zone--empty" data-tech-id="${tech.id}"><p class="routes-empty">Sin paradas asignadas.</p></div>`
            : `<ul class="stops-ul route-drop-zone" data-tech-id="${tech.id}">
                ${tech.stops.map((s, i) => `
                    <li class="stop-item${editing ? ' stop-item--editable' : ''}"
                        ${editing ? `draggable="true" data-tech-id="${tech.id}" data-idx="${i}"` : ''}>
                        ${editing
                            ? `<span class="stop-drag-handle" title="Arrastrar para reasignar">⠿</span>`
                            : `<span class="stop-index">${i + 1}</span>`}
                        <div class="stop-name">
                            <span class="stop-recipient">${s.city || ''}</span>
                            <span class="stop-address-line">${s.name}</span>
                            <span class="stop-address-line stop-address-detail">${s.address || ''}${s.addressDetail ? ', ' + s.addressDetail : ''}</span>
                            ${s.folio ? `<span class="stop-folio-tag">${s.folio}</span>` : ''}
                        </div>
                        ${!editing ? `
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((s.address || s.name) + ', ' + (s.city || ''))}" target="_blank" class="btn-maps-inline">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                                Maps
                            </a>` : ''}
                        ${editing ? `<button class="stop-remove" data-tech-id="${tech.id}" data-idx="${i}">✕</button>` : ''}
                    </li>
                `).join('')}
               </ul>`;

        const optimizedHtml = (!editing && tech.optimized && tech._optimizedRoute) ? `
            <hr class="divider">
            <div class="optimized-result-header">
                <span class="optimized-label">RUTA OPTIMIZADA</span>
                <span class="optimized-distance">${tech.distance.toFixed(2)} km</span>
            </div>
            <ol class="stops-ul">
                ${(() => {
                    let n = 0;
                    return tech._optimizedRoute.map(s => s._isOrigin ? `
                        <li class="stop-item stop-item-origin">
                            <span class="stop-origin-dot">●</span>
                            <div class="stop-name">
                                <span class="stop-recipient">${s.city}</span>
                                <span class="stop-address-line">Ubicación del técnico</span>
                            </div>
                        </li>
                    ` : `
                        <li class="stop-item stop-item-optimized">
                            <span class="stop-index">${++n}</span>
                            <div class="stop-name">
                                <span class="stop-recipient">${s.city || ''}</span>
                                <span class="stop-address-line">${s.name}</span>
                                <span class="stop-address-line stop-address-detail">${s.address || ''}${s.addressDetail ? ', ' + s.addressDetail : ''}</span>
                            </div>
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((s.address || s.name) + ', ' + (s.city || ''))}" target="_blank" class="btn-maps-inline">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                                Maps
                            </a>
                        </li>
                    `).join('');
                })()}
            </ol>
            <div class="route-bottom-actions">
                <button class="btn-secondary btn-sm btn-edit-assign" data-edit-tech="${tech.id}">✎ Editar Asignación</button>
                <button class="btn-secondary btn-sm btn-reactive-mode" data-load-btn>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4l3 3"/></svg>
                    Modo Reactivo
                </button>
            </div>
        ` : '';

        return `
            <div class="routes-card tech-route-card" id="route-card-${tech.id}">
                <div class="tech-route-header">
                    <div class="tech-route-title">
                        <span class="tech-route-dot"></span>
                        <h4 class="routes-section-title" style="margin:0">Ruta — ${tech.name}</h4>
                    </div>
                </div>
                ${stopsHtml}
                ${optimizedHtml}
            </div>
        `;
    }

    _bindRouteCardEvents(tech) {
        const card = document.getElementById(`route-card-${tech.id}`);
        if (!card) return;

        // Bottom action buttons in optimized route
        card.querySelector('[data-load-btn]')?.addEventListener('click', () => {
            this._loadPlanHandler && this._loadPlanHandler();
        });
        card.querySelector(`[data-edit-tech="${tech.id}"]`)?.addEventListener('click', () => {
            this._editMode = !this._editMode;
            const mainEditBtn = document.getElementById('edit-routes-btn');
            if (mainEditBtn) {
                mainEditBtn.textContent = this._editMode ? '✓ Listo' : '✎ Editar Asignación';
                mainEditBtn.classList.toggle('btn-edit--active', this._editMode);
            }
            if (this._currentTechs) this.renderAllRoutes(this._currentTechs);
        });

        const clearIndicators = () => card.querySelectorAll('.stop-item--drag-above, .stop-item--drag-below')
            .forEach(el => el.classList.remove('stop-item--drag-above', 'stop-item--drag-below'));

        if (this._editMode) {
            card.querySelectorAll('.stop-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    this._removeStopHandler && this._removeStopHandler(btn.dataset.techId, parseInt(btn.dataset.idx));
                });
            });

            card.querySelectorAll('.stop-item--editable').forEach(item => {
                item.addEventListener('dragstart', e => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('application/json', JSON.stringify({
                        techId: item.dataset.techId,
                        idx:    parseInt(item.dataset.idx)
                    }));
                    setTimeout(() => item.classList.add('stop-item--dragging'), 0);
                });
                item.addEventListener('dragend', () => {
                    item.classList.remove('stop-item--dragging');
                    clearIndicators();
                });
                item.addEventListener('dragover', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearIndicators();
                    const mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
                    item.classList.add(e.clientY < mid ? 'stop-item--drag-above' : 'stop-item--drag-below');
                });
                item.addEventListener('dragleave', e => {
                    if (!item.contains(e.relatedTarget))
                        item.classList.remove('stop-item--drag-above', 'stop-item--drag-below');
                });
                item.addEventListener('drop', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearIndicators();
                    card.querySelectorAll('.route-drop-zone').forEach(z => z.classList.remove('route-drop-zone--over'));
                    try {
                        const data     = JSON.parse(e.dataTransfer.getData('application/json'));
                        const hoverIdx = parseInt(item.dataset.idx);
                        const before   = e.clientY < item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
                        if (data.techId === tech.id) {
                            let insertIdx = before ? hoverIdx : hoverIdx + 1;
                            if (data.idx < insertIdx) insertIdx--;
                            if (insertIdx !== data.idx && insertIdx >= 0)
                                this._reorderStopHandler && this._reorderStopHandler(tech.id, data.idx, insertIdx);
                        } else {
                            this._moveStopHandler && this._moveStopHandler(data.techId, data.idx, tech.id);
                        }
                    } catch (_) {}
                });
            });
        }

        card.querySelectorAll('.route-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', e => {
                if (!this._editMode) return;
                e.preventDefault();
                zone.classList.add('route-drop-zone--over');
            });
            zone.addEventListener('dragleave', e => {
                if (!zone.contains(e.relatedTarget)) zone.classList.remove('route-drop-zone--over');
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('route-drop-zone--over');
                clearIndicators();
                try {
                    const data = JSON.parse(e.dataTransfer.getData('application/json'));
                    if (data.techId !== tech.id)
                        this._moveStopHandler && this._moveStopHandler(data.techId, data.idx, tech.id);
                } catch (_) {}
            });
        });
    }

    _renderNewOTForm() {
        const el = document.getElementById('new-ot-section');
        if (!el) return;
        const available = this._shipments
            .map((s, i) => ({ s, i }))
            .filter(({ s }) => !s._added);
        if (available.length === 0) {
            el.innerHTML = '<p class="routes-empty">No hay envíos disponibles para asignar.</p>';
            return;
        }
        el.innerHTML = `
            <div class="new-ot-form">
                <div class="ot-check-header">
                    <label class="ot-check-all-label">
                        <span class="ot-check-icon-wrap" id="ot-check-all-icon">
                            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2" fill="#3b82f6"/><path d="M4 8l3 3 5-5" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </span>
                        <span class="ot-check-all-text">SELECCIONAR TODO</span>
                    </label>
                </div>
                <ul class="ot-check-list">
                    ${available.map(({ s, i }) => `
                        <li class="ot-check-item" data-idx="${i}">
                            <label class="ot-check-label">
                                <span class="ot-check-icon-wrap ot-item-icon" data-idx="${i}">
                                    <svg viewBox="0 0 16 16" width="13" height="13"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="#d1d5db" stroke-width="1.5"/></svg>
                                </span>
                                <span class="ot-check-info">
                                    <span class="ot-check-city">${s.city}</span>
                                    <span class="ot-check-name">${s.recipient}</span>
                                    <span class="ot-check-addr">${s.address}${s.addressDetail ? ', ' + s.addressDetail : ''}</span>
                                    <span class="ot-check-tags">
                                        ${s.folio ? `<span class="shipment-tag shipment-tag--folio">${s.folio}</span>` : ''}
                                        ${s.timeWindowStart ? `<span class="shipment-tag shipment-tag--time">⏱ ${s.timeWindowStart} – ${s.timeWindowEnd}</span>` : ''}
                                    </span>
                                </span>
                            </label>
                        </li>
                    `).join('')}
                </ul>
                <div class="new-ot-actions">
                    <button id="analyze-ot-btn" class="btn-primary btn-analyze">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        Analizar y Sugerir
                    </button>
                </div>
            </div>
        `;

        // Track checked state manually
        const checkedSet = new Set();
        const allIdxs    = available.map(({ i }) => i);

        const updateAllIcon = () => {
            const iconEl = document.getElementById('ot-check-all-icon');
            if (!iconEl) return;
            const allChecked = allIdxs.every(i => checkedSet.has(i));
            iconEl.innerHTML = allChecked
                ? `<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2" fill="#3b82f6"/><path d="M4 8l3 3 5-5" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg viewBox="0 0 16 16" width="13" height="13"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="#d1d5db" stroke-width="1.5"/></svg>`;
        };

        const updateItemIcon = (idx, checked) => {
            const iconEl = el.querySelector(`.ot-item-icon[data-idx="${idx}"]`);
            if (!iconEl) return;
            iconEl.innerHTML = checked
                ? `<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2" fill="#3b82f6"/><path d="M4 8l3 3 5-5" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg viewBox="0 0 16 16" width="13" height="13"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="#d1d5db" stroke-width="1.5"/></svg>`;
        };

        // Select all toggle
        el.querySelector('#ot-check-all-icon')?.closest('label')?.addEventListener('click', () => {
            const allChecked = allIdxs.every(i => checkedSet.has(i));
            if (allChecked) {
                allIdxs.forEach(i => checkedSet.delete(i));
            } else {
                allIdxs.forEach(i => checkedSet.add(i));
            }
            allIdxs.forEach(i => updateItemIcon(i, checkedSet.has(i)));
            updateAllIcon();
        });

        el.querySelectorAll('.ot-check-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.idx);
                if (checkedSet.has(idx)) {
                    checkedSet.delete(idx);
                } else {
                    checkedSet.add(idx);
                }
                updateItemIcon(idx, checkedSet.has(idx));
                updateAllIcon();
            });
        });

        document.getElementById('analyze-ot-btn')?.addEventListener('click', () => {
            if (checkedSet.size === 0) {
                this.showToast('Selecciona al menos un envío antes de analizar.', 'warning');
                return;
            }
            const ots = [...checkedSet].map(idx => {
                const s = this._shipments[idx];
                return { name: s.recipient, city: s.city, address: s.address, addressDetail: s.addressDetail, folio: s.folio, lat: s.lat, lng: s.lng, _shipIdx: idx };
            });
            this._analyzeOTHandler && this._analyzeOTHandler(ots);
        });
    }
}
