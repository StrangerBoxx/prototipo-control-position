class LoginView {
    constructor(container) {
        this.container = container;
    }

    render() {
        this.container.innerHTML = `
            <div class="login-page">
                <div class="login-card">
                    <h3 class="login-title">Control Position</h3>
                    <hr class="divider">
                    <h4 class="login-subtitle">Iniciar sesión</h4>
                    <form id="login-form" autocomplete="off" novalidate>
                        <div class="form-item">
                            <div class="input-group">
                                <span class="input-prefix">
                                    <svg viewBox="64 64 896 896" fill="currentColor" aria-hidden="true">
                                        <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"/>
                                    </svg>
                                </span>
                                <input id="login-email" type="email" class="form-input" placeholder="Nombre de usuario" autocomplete="off">
                            </div>
                            <div class="error-msg" id="email-error">Introduzca su nombre de usuario.</div>
                        </div>
                        <div class="form-item">
                            <div class="input-group">
                                <span class="input-prefix">
                                    <svg viewBox="64 64 896 896" fill="currentColor" aria-hidden="true">
                                        <path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 10-56 0z"/>
                                    </svg>
                                </span>
                                <input id="login-password" type="password" class="form-input" placeholder="Contraseña" autocomplete="off">
                            </div>
                            <div class="error-msg" id="password-error">Introduzca su contraseña.</div>
                        </div>
                        <div class="forgot-link-row">
                            <a href="#" class="forgot-link">Olvidé mi contraseña</a>
                        </div>
                        <div class="error-msg" id="login-error" style="margin-bottom: 8px;"></div>
                        <button type="submit" class="btn-primary">
                            <svg viewBox="64 64 896 896" fill="currentColor" width="14" height="14">
                                <path d="M521.7 82c-152.5-.4-286.7 78.5-363.4 197.7-3.4 5.3.4 12.3 6.7 12.3h70.3c4.8 0 9.3-2.1 12.3-5.8 7-8.5 14.5-16.7 22.4-24.5 32.6-32.5 70.5-58.1 112.7-75.9 43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 32.6 32.5 58.1 70.4 76 112.5C865.7 417.8 875 464.1 875 512c0 47.9-9.4 94.2-27.8 137.8-17.8 42.1-43.4 80-76 112.5s-70.5 58.1-112.7 75.9A352.8 352.8 0 01520.6 866c-47.9 0-94.3-9.4-137.9-27.8A353.84 353.84 0 01270 762.3c-7.9-7.9-15.3-16.1-22.4-24.5-3-3.7-7.6-5.8-12.3-5.8H165c-6.3 0-10.2 7-6.7 12.3C234.9 863.2 368.5 942 520.6 942c236.2 0 428-190.1 430.4-425.6C953.4 277.1 761.3 82.6 521.7 82zM395.02 624v-76h-314c-4.4 0-8-3.6-8-8v-56c0-4.4 3.6-8 8-8h314v-76c0-6.7 7.8-10.5 13-6.3l141.9 112a8 8 0 010 12.6l-141.9 112c-5.2 4.1-13 .4-13-6.3z"/>
                            </svg>
                            Iniciar sesión
                        </button>
                    </form>
                </div>
            </div>
        `;
        return this;
    }

    bindSubmit(handler) {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            const emailErr = document.getElementById('email-error');
            const passErr = document.getElementById('password-error');
            emailErr.style.display = 'none';
            passErr.style.display = 'none';

            let valid = true;
            if (!email) { emailErr.style.display = 'block'; valid = false; }
            if (!password) { passErr.style.display = 'block'; valid = false; }
            if (valid) handler(email, password);
        });
    }

    showError(message) {
        const err = document.getElementById('login-error');
        err.textContent = message;
        err.style.display = 'block';
    }
}
