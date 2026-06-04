class RoutesController {
    constructor(routesView, dashboardView, apiModel) {
        this.routesView       = routesView;
        this.dashboardView    = dashboardView;
        this.apiModel         = apiModel;
        this._technicians     = [
            { id: 'tech_1', name: 'Pedro Sánchez Rojas', location: 'Viña del Mar', lat: -33.0245, lng: -71.5518, stops: [], distance: 0, optimized: false, _optimizedRoute: null },
            { id: 'tech_2', name: 'Marcos Alfaro López',  location: 'Santiago',     lat: -33.4489, lng: -70.6693, stops: [], distance: 0, optimized: false, _optimizedRoute: null },
            { id: 'tech_3', name: 'Isabel Torres Pinto',  location: 'Concepción',   lat: -36.8270, lng: -73.0503, stops: [], distance: 0, optimized: false, _optimizedRoute: null },
            { id: 'tech_4', name: 'Diego Fuentes Neira',  location: 'Valparaíso',   lat: -33.0472, lng: -71.6127, stops: [], distance: 0, optimized: false, _optimizedRoute: null }
        ];
        this._shipments       = [];
        this._isLiveMode      = false;
        this._pendingBatch    = null;
    }

    init() {
        this.dashboardView.setContent(this.routesView.getHTML());
        this.routesView.bindEvents();
        this.routesView.onRemoveTechnician(techId => this._removeTechnician(techId));
        this.routesView.onRemoveStop((techId, stopIdx) => this._removeStop(techId, stopIdx));
        this.routesView.onAutoAssign(() => this._autoAssign());
        this.routesView.onMoveStop((fromId, idx, toId) => this._moveStop(fromId, idx, toId));
        this.routesView.onReorderStop((techId, from, to) => this._reorderStop(techId, from, to));
        this.routesView.onSavePlan(() => this._savePlan());
        this.routesView.onLoadPlan(() => this._loadPlan());
        this.routesView.onExitLiveMode(() => this._exitLiveMode());
        this.routesView.onToggleCompleted((techId, stopIdx, val) => this._toggleCompleted(techId, stopIdx, val));
        this.routesView.onAnalyzeNewOT(ot => this._suggestAssignment(ot));
        this.routesView.onConfirmSuggestion(() => this._confirmSuggestion());
        this.routesView.onReassignOT(techId => this._reassignOT(techId));
        this.routesView.onDiscardOT(() => {
            this._pendingBatch = null;
            this.routesView.clearSuggestion();
        });
        this.routesView.renderTechnicians(this._technicians);
        this.routesView.renderAllRoutes(this._technicians);
        this._loadShipments();
    }

    async _loadShipments() {
        try {
            const data = await this.apiModel.query('shippings.json');
            this._shipments = data.items || [];
            this.routesView.setShipments(this._shipments);
            this.routesView.refreshShipments(this._technicians);
        } catch (e) {
            this.routesView.setError('Error al cargar los envíos.');
        }
    }

    _addTechnician(name) {
        const trimmed = name.trim();
        if (!trimmed) return;
        this._technicians.push({
            id:       'tech_' + Date.now(),
            name:     trimmed,
            stops:    [],
            distance: 0,
            optimized: false,
            _optimizedRoute: null
        });
        this.routesView.renderTechnicians(this._technicians);
        this.routesView.renderAllRoutes(this._technicians);
        this.routesView.refreshShipments(this._technicians);
    }

    _removeTechnician(techId) {
        const tech = this._technicians.find(t => t.id === techId);
        if (tech) {
            tech.stops.forEach(s => {
                if (s._shipIdx !== undefined) this.routesView.markShipmentAvailable(s._shipIdx);
            });
        }
        this._technicians = this._technicians.filter(t => t.id !== techId);
        this.routesView.renderTechnicians(this._technicians);
        this.routesView.renderAllRoutes(this._technicians);
        this.routesView.refreshShipments(this._technicians);
    }

    _autoAssign() {
        const unassigned = this.routesView.getUnassignedShipments();
        if (unassigned.length === 0) {
            this.routesView.showToast('No hay órdenes disponibles para asignar.', 'warning');
            return;
        }
        const positions = {};
        this._technicians.forEach(t => { positions[t.id] = { lat: t.lat, lng: t.lng }; });

        for (const { ship, idx } of unassigned) {
            let bestTech = null;
            let bestDist = Infinity;
            for (const tech of this._technicians) {
                const d = this._haversine(positions[tech.id], ship);
                if (d < bestDist) { bestDist = d; bestTech = tech; }
            }
            if (bestTech) {
                bestTech.stops.push({
                    name: ship.recipient, city: ship.city, address: ship.address,
                    addressDetail: ship.addressDetail, folio: ship.folio,
                    patent: ship.patent, phone: ship.phone, meter: ship.meter,
                    lat: ship.lat, lng: ship.lng, _shipIdx: idx, completed: false
                });
                bestTech.optimized = false;
                positions[bestTech.id] = { lat: ship.lat, lng: ship.lng };
                this.routesView.markShipmentAdded(idx);
            }
        }
        this._technicians.forEach(tech => this._optimizeTechData(tech));
        this.routesView.renderTechnicians(this._technicians);
        this.routesView.renderAllRoutes(this._technicians);
        this.routesView.refreshShipments(this._technicians);
        this.routesView.showToast('Rutas asignadas y optimizadas.', 'success');
    }

    _assignShipment(shipIdx, techId) {
        const tech = this._technicians.find(t => t.id === techId);
        const ship = this.routesView.getShipment(shipIdx);
        if (!tech || !ship) return;
        tech.stops.push({
            name:        ship.recipient,
            city:        ship.city,
            address:     ship.address,
            addressDetail: ship.addressDetail,
            folio:       ship.folio,
            patent:      ship.patent,
            phone:       ship.phone,
            meter:       ship.meter,
            lat:         ship.lat,
            lng:         ship.lng,
            _shipIdx:    shipIdx,
            completed:   false
        });
        tech.optimized = false;
        this.routesView.markShipmentAdded(shipIdx);
        this.routesView.renderAllRoutes(this._technicians);
        this.routesView.refreshShipments(this._technicians);
    }

    _removeStop(techId, stopIdx) {
        const tech = this._technicians.find(t => t.id === techId);
        if (!tech) return;
        const stop = tech.stops[stopIdx];
        if (stop && stop._shipIdx !== undefined) this.routesView.markShipmentAvailable(stop._shipIdx);
        tech.stops.splice(stopIdx, 1);
        this._optimizeTechData(tech);
        this.routesView.renderTechnicians(this._technicians);
        this.routesView.renderAllRoutes(this._technicians);
        this.routesView.refreshShipments(this._technicians);
    }

    _optimizeTechData(tech) {
        if (tech.stops.length === 0) {
            tech.optimized       = false;
            tech._optimizedRoute = null;
            tech.distance        = 0;
            return;
        }
        const origin          = [{ name: tech.location, city: tech.location, address: '', lat: tech.lat, lng: tech.lng, _isOrigin: true }];
        const all             = [...origin, ...tech.stops];
        const { route, total} = this._optimizeStops(all);
        tech._optimizedRoute  = route;
        tech.distance         = total;
        tech.optimized        = true;
    }

    _reorderStop(techId, fromIdx, toIdx) {
        const tech = this._technicians.find(t => t.id === techId);
        if (!tech || fromIdx === toIdx) return;
        const stop = tech.stops.splice(fromIdx, 1)[0];
        tech.stops.splice(toIdx, 0, stop);
        tech.optimized       = false;
        tech._optimizedRoute = null;
        this.routesView.renderAllRoutes(this._technicians);
    }

    _moveStop(fromTechId, fromIdx, toTechId) {
        const fromTech = this._technicians.find(t => t.id === fromTechId);
        const toTech   = this._technicians.find(t => t.id === toTechId);
        if (!fromTech || !toTech) return;
        const stop = fromTech.stops.splice(fromIdx, 1)[0];
        if (!stop) return;
        toTech.stops.push(stop);
        this._optimizeTechData(fromTech);
        this._optimizeTechData(toTech);
        this.routesView.renderTechnicians(this._technicians);
        this.routesView.renderAllRoutes(this._technicians);
    }

    _optimizeStops(stops) {
        const visited = new Array(stops.length).fill(false);
        const route   = [];
        let current   = 0;
        let total     = 0;
        visited[0] = true;
        route.push(stops[0]);
        for (let step = 1; step < stops.length; step++) {
            let nearest = -1;
            let minDist = Infinity;
            for (let i = 0; i < stops.length; i++) {
                if (!visited[i]) {
                    const d = this._haversine(stops[current], stops[i]);
                    if (d < minDist) { minDist = d; nearest = i; }
                }
            }
            visited[nearest] = true;
            route.push(stops[nearest]);
            total  += minDist;
            current = nearest;
        }
        return { route, total };
    }

    _savePlan() {
        if (this._technicians.length === 0) {
            this.routesView.showToast('Agrega al menos un técnico antes de guardar.', 'warning');
            return;
        }
        if (!this._technicians.some(t => t.stops.length > 0)) {
            this.routesView.showToast('Agrega paradas a los técnicos antes de guardar.', 'warning');
            return;
        }
        const plan = {
            savedAt:     Date.now(),
            origin:      this.routesView.getSelectedLocation(),
            technicians: JSON.parse(JSON.stringify(this._technicians))
        };
        sessionStorage.setItem('cp_day_plan', JSON.stringify(plan));
        this.routesView.showToast('Planificación guardada correctamente.', 'success');
    }

    _loadPlan() {
        const raw = sessionStorage.getItem('cp_day_plan');
        if (!raw) {
            this.routesView.showToast('No hay planificación guardada para el día.', 'warning');
            return;
        }
        const plan        = JSON.parse(raw);
        this._technicians = plan.technicians;
        this._isLiveMode  = true;
        this._autoCompleteByTime();
        this.routesView.enterLiveMode(plan, this._technicians);
    }

    _autoCompleteByTime() {
        const now    = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        this._technicians.forEach(tech => {
            tech.stops.forEach(stop => {
                if (stop.timeWindowEnd) {
                    const [h, m] = stop.timeWindowEnd.split(':').map(Number);
                    if (h * 60 + m < nowMin) stop.completed = true;
                }
            });
        });
    }

    _exitLiveMode() {
        this._isLiveMode   = false;
        this._pendingBatch = null;
        this.routesView.exitLiveMode(this._technicians);
    }

    _toggleCompleted(techId, stopIdx, val) {
        const tech = this._technicians.find(t => t.id === techId);
        if (!tech) return;
        tech.stops[stopIdx].completed = val;
        this.routesView.updateRouteProgress(this._technicians);
    }

    _suggestAssignment(ots) {
        if (!Array.isArray(ots) || ots.length === 0) {
            this.routesView.showToast('Selecciona al menos una orden de trabajo.', 'warning');
            return;
        }
        // Track tentative positions and loads per tech across iterations
        const positions = {};
        const loads     = {};
        this._technicians.forEach(t => {
            const done = t.stops.filter(s => s.completed);
            positions[t.id] = done.length > 0 ? done[done.length - 1] : { lat: t.lat, lng: t.lng };
            loads[t.id]     = t.stops.filter(s => !s.completed).length;
        });

        const assignments = [];
        for (const ot of ots) {
            const maxLoad = Math.max(...Object.values(loads), 1);
            const dists   = this._technicians.map(t => this._haversine(positions[t.id], ot));
            const maxDist = Math.max(...dists, 1);
            const scored  = this._technicians.map((t, i) => ({
                tech:  t,
                score: (dists[i] / maxDist) * 0.6 + (loads[t.id] / maxLoad) * 0.4
            }));
            scored.sort((a, b) => a.score - b.score);
            const best   = scored[0].tech;
            const load   = loads[best.id];
            const reason = load === 0
                ? 'Sin paradas pendientes, menor carga.'
                : `${load} parada${load !== 1 ? 's' : ''} pendiente${load !== 1 ? 's' : ''}, zona más cercana.`;
            assignments.push({ ot, tech: best, reason });
            positions[best.id] = { lat: ot.lat, lng: ot.lng };
            loads[best.id]++;
        }

        this._pendingBatch = assignments;
        this.routesView.showSuggestion(assignments);
    }

    _confirmSuggestion() {
        if (!this._pendingBatch) return;
        for (const { ot, tech } of this._pendingBatch) {
            if (ot._shipIdx !== undefined) this.routesView.markShipmentAdded(ot._shipIdx);
            tech.stops.push({ ...ot, completed: false });
        }
        const n = this._pendingBatch.length;
        this._pendingBatch = null;
        this.routesView.clearSuggestion();
        this.routesView.clearNewOTForm();
        this.routesView.updateRouteProgress(this._technicians);
        this.routesView.showToast(`${n} orden${n !== 1 ? 'es' : ''} asignada${n !== 1 ? 's' : ''} correctamente.`, 'success');
    }

    _haversine(a, b) {
        const R    = 6371;
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const s    = Math.sin(dLat / 2) ** 2 +
                     Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
                     Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    }
}
