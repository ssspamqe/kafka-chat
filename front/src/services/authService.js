class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = new Set();
  }

  login(username) {
    this.currentUser = {username};
    this.notifyListeners();
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.notifyListeners();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.currentUser));
  }
}

export const authService = new AuthService();
