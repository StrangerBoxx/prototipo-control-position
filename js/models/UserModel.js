class UserModel {
    constructor() {
        this.email = null;
        this.isAuthenticated = false;
    }

    login(email, password) {
        if (email !== 'TestingPrototipo' || password !== 'Prototipo123') return false;
        this.email = email;
        this.isAuthenticated = true;
        sessionStorage.setItem('cp_user', JSON.stringify({ email }));
        return true;
    }

    logout() {
        this.email = null;
        this.isAuthenticated = false;
        sessionStorage.removeItem('cp_user');
    }

    restore() {
        const stored = sessionStorage.getItem('cp_user');
        if (stored) {
            const data = JSON.parse(stored);
            this.email = data.email;
            this.isAuthenticated = true;
        }
        return this.isAuthenticated;
    }

    getEmail() { return this.email; }
}
