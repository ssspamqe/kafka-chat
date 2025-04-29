import { apiService } from "./apiService";

class AuthService {
  constructor() {
    this.currentUser = null;
    this.STORAGE_KEY = "chatCurrentUser";
  }

  async login(username) {
    try {
      if (!username || username.length < 3) {
        throw new Error("Username must be at least 3 characters");
      }

      const response = await apiService.sendRequest(
        `/user/${username}`,
        {},
        'POST',
        'MONGO'
      );

      const userData = {
        username,
        tag: response?.tag || null,
        chats: Array.isArray(response?.chats) ? response.chats : ['global']
      };

      this.currentUser = userData;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(
        error.message.includes('already exists') 
          ? `Username "${username}" is already taken`
          : 'Login failed. Please try again later.'
      );
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentUser() {
    if (!this.currentUser) {
      try {
        const savedUser = localStorage.getItem(this.STORAGE_KEY);
        if (savedUser) {
          this.currentUser = JSON.parse(savedUser);
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }
}

export const authService = new AuthService();