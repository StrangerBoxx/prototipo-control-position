class DashboardView {
    constructor(container) {
        this.container = container;
        this._inactivityTimer = null;
        this._logoutHandler = null;
    }

    render(userEmail) {
        this.container.innerHTML = `
            <div id="sider-overlay" class="sider-overlay"></div>
            <div class="app-layout">
                <aside class="app-sider" id="app-sider">
                    <a class="sidebar-logo" href="#">
                        <img src="https://app.controlposition.cl/assets/img/icono_alta_resolucion.png"
                             alt="logo"
                             onerror="this.style.display='none'">
                        <h1>Control Position</h1>
                    </a>
                    <div class="menu-filter">
                        <input type="text" class="menu-filter-input" placeholder="Buscar..." id="menu-filter">
                    </div>
                    <ul class="sidebar-menu">
                        <li class="sidebar-submenu open" id="api-submenu">
                            <div class="sidebar-submenu-title" id="api-submenu-toggle">
                                <svg viewBox="64 64 896 896" fill="currentColor">
                                    <path d="M917.7 148.8l-42.4-42.4c-1.6-1.6-3.6-2.3-5.7-2.3s-4.1.8-5.7 2.3l-76.1 76.1a199.27 199.27 0 00-112.1-34.3c-51.2 0-102.4 19.5-141.5 58.6L432.3 308.7a8.03 8.03 0 000 11.3L704 591.7c1.6 1.6 3.6 2.3 5.7 2.3 2 0 4.1-.8 5.7-2.3l101.9-101.9c68.9-69 77-175.7 24.3-253.5l76.1-76.1c3.1-3.2 3.1-8.3 0-11.4zM769.1 441.7l-59.4 59.4-186.8-186.8 59.4-59.4c24.9-24.9 58.1-38.7 93.4-38.7 35.3 0 68.4 13.7 93.4 38.7 24.9 24.9 38.7 58.1 38.7 93.4 0 35.3-13.8 68.4-38.7 93.4zm-190.2 105a8.03 8.03 0 00-11.3 0L501 613.3 410.7 523l66.7-66.7c3.1-3.1 3.1-8.2 0-11.3L441 408.6a8.03 8.03 0 00-11.3 0L363 475.3l-43-43a7.85 7.85 0 00-5.7-2.3c-2 0-4.1.8-5.7 2.3L206.8 534.2c-68.9 69-77 175.7-24.3 253.5l-76.1 76.1a8.03 8.03 0 000 11.3l42.4 42.4c1.6 1.6 3.6 2.3 5.7 2.3s4.1-.8 5.7-2.3l76.1-76.1c33.7 22.9 72.9 34.3 112.1 34.3 51.2 0 102.4-19.5 141.5-58.6l101.9-101.9c3.1-3.1 3.1-8.2 0-11.3l-43-43 66.7-66.7c3.1-3.1 3.1-8.2 0-11.3l-36.6-36.2zM441.7 769.1a131.32 131.32 0 01-93.4 38.7c-35.3 0-68.4-13.7-93.4-38.7a131.32 131.32 0 01-38.7-93.4c0-35.3 13.7-68.4 38.7-93.4l59.4-59.4 186.8 186.8-59.4 59.4z"/>
                                </svg>
                                <span class="submenu-title-text">API Externas</span>
                                <span class="submenu-arrow"></span>
                            </div>
                            <ul class="submenu-items">
                                <li class="submenu-item active" id="nav-explorer">
                                    <a href="#">Bsale Explorer</a>
                                </li>
                            </ul>
                        </li>
                        <li class="sidebar-submenu open" id="routes-submenu">
                            <div class="sidebar-submenu-title" id="routes-submenu-toggle">
                                <svg viewBox="64 64 896 896" fill="currentColor">
                                    <path d="M740 161c-61.5 0-112 50.5-112 112 0 47.7 29.9 88.5 72 104.6V386c0 8.8-7.2 16-16 16H548.5c-10.3 0-20.4 2.2-29.5 6.4V265.6c42.1-16.1 72-56.9 72-104.6C591 99.5 540.5 49 479 49S367 99.5 367 161c0 47.7 29.9 88.5 72 104.6V638.4C439.9 654.5 410 695.3 410 743c0 61.5 50.5 112 112 112s112-50.5 112-112c0-47.7-29.9-88.5-72-104.6V514c0-8.8 7.2-16 16-16h135.5c61.5 0 112-50.5 112-112v-20.4c42.1-16.1 72-56.9 72-104.6 0-61.5-50.5-112-112-112zM479 113c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48zm44 630c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zm217-322c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"/>
                                </svg>
                                <span class="submenu-title-text">Rutas:</span>
                                <span class="submenu-arrow"></span>
                            </div>
                            <ul class="submenu-items">
                                <li class="submenu-item" id="nav-routes">
                                    <a href="#">Optimizador de Rutas</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <div class="sider-trigger" id="sider-trigger">
                        <span class="trigger-icon">&#171;</span>
                    </div>
                </aside>

                <div class="app-main">
                    <header class="app-header">
                        <ul class="header-menu">
                            <li class="header-menu-item">
                                <span class="notification-badge">
                                    <svg viewBox="64 64 896 896" fill="currentColor" title="Notificaciones">
                                        <path d="M880 112c-3.8 0-7.7.7-11.6 2.3L292 345.9H128c-8.8 0-16 7.4-16 16.6v299c0 9.2 7.2 16.6 16 16.6h101.7c-3.7 11.6-5.7 23.9-5.7 36.4 0 65.9 53.8 119.5 120 119.5 55.4 0 102.1-37.6 115.9-88.4l408.6 164.2c3.9 1.5 7.8 2.3 11.6 2.3 16.9 0 32-14.2 32-33.2V145.2C912 126.2 897 112 880 112zM344 762.3c-26.5 0-48-21.4-48-47.8 0-11.2 3.9-21.9 11-30.4l84.9 34.1c-2 24.6-22.7 44.1-47.9 44.1zm496 58.4L318.8 611.3l-12.9-5.2H184V417.9h121.9l12.9-5.2L840 203.3v617.4z"/>
                                    </svg>
                                    <span class="notification-dot"></span>
                                </span>
                            </li>
                            <li class="header-menu-item">
                                <div class="user-dropdown">
                                    <span class="user-dropdown-trigger">
                                        <svg viewBox="64 64 896 896" fill="currentColor" width="16" height="16">
                                            <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"/>
                                        </svg>
                                        ${userEmail} &nbsp;
                                    </span>
                                    <ul class="user-dropdown-menu">
                                        <li id="logout-btn" class="danger">Cerrar sesión</li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </header>

                    <div class="app-content">
                        <div class="inner-content" id="main-content"></div>
                    </div>

                    <footer class="app-footer">
                        Control Position <a href="#">V1.37.1</a> ©2026
                    </footer>
                </div>
            </div>
        `;

        this._bindSidebarEvents();
        this._startInactivityTimer();
        return this;
    }

    _bindSidebarEvents() {
        const trigger = document.getElementById('sider-trigger');
        const sider = document.getElementById('app-sider');
        const overlay = document.getElementById('sider-overlay');

        trigger && trigger.addEventListener('click', () => {
            sider.classList.toggle('collapsed');
            overlay && overlay.classList.toggle('visible', !sider.classList.contains('collapsed') && window.innerWidth <= 992);
        });

        overlay && overlay.addEventListener('click', () => {
            sider.classList.add('collapsed');
            overlay.classList.remove('visible');
        });

        const apiToggle = document.getElementById('api-submenu-toggle');
        const apiSubmenu = document.getElementById('api-submenu');
        apiToggle && apiToggle.addEventListener('click', () => {
            apiSubmenu.classList.toggle('open');
        });

        const routesToggle = document.getElementById('routes-submenu-toggle');
        const routesSubmenu = document.getElementById('routes-submenu');
        routesToggle && routesToggle.addEventListener('click', () => {
            routesSubmenu.classList.toggle('open');
        });
    }

    bindNavigation(handlers) {
        const explorerItem = document.getElementById('nav-explorer');
        explorerItem && explorerItem.addEventListener('click', (e) => {
            e.preventDefault();
            this._setActiveMenuItem('nav-explorer');
            handlers.explorer && handlers.explorer();
        });

        const routesItem = document.getElementById('nav-routes');
        routesItem && routesItem.addEventListener('click', (e) => {
            e.preventDefault();
            this._setActiveMenuItem('nav-routes');
            handlers.routes && handlers.routes();
        });
    }

    _setActiveMenuItem(id) {
        document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('active'));
        const el = document.getElementById(id);
        el && el.classList.add('active');
    }

    _startInactivityTimer() {
        const TIMEOUT_MS = 5 * 60 * 1000;
        const resetTimer = () => {
            clearTimeout(this._inactivityTimer);
            this._inactivityTimer = setTimeout(() => this._showInactivityModal(), TIMEOUT_MS);
        };
        ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt =>
            document.addEventListener(evt, resetTimer, { passive: true })
        );
        resetTimer();
    }

    _showInactivityModal() {
        if (document.getElementById('inactivity-modal')) return;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'inactivity-modal';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">¡Has estado inactivo!</div>
                <div class="modal-body">Tu sesión está a punto de cerrarse por inactividad.</div>
                <div class="modal-footer">
                    <button class="btn-default" id="modal-stay">Permanecer</button>
                    <button class="btn-primary" id="modal-logout" style="width:auto;margin:0">Cerrar Sesión</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('modal-stay').addEventListener('click', () => {
            overlay.remove();
        });
        document.getElementById('modal-logout').addEventListener('click', () => {
            overlay.remove();
            this._logoutHandler && this._logoutHandler();
        });
    }

    bindLogout(handler) {
        this._logoutHandler = handler;
        const btn = document.getElementById('logout-btn');
        btn && btn.addEventListener('click', () => {
            clearTimeout(this._inactivityTimer);
            handler();
        });
    }

    setContent(html) {
        const content = document.getElementById('main-content');
        if (content) content.innerHTML = html;
    }
}
