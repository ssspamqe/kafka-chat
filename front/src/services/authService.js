import { apiService } from "./apiService";

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  async login(username) {
    try {
      const response = await apiService.sendRequest(
        `/user/${username}`,
        {},
        'POST',
        'MONGO'
      );

      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
      this.currentUser = {
        username,
        tag: response?.tag || null,
        chats: response?.chats || ['global']
      };
      
      return this.currentUser;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout() {
    this.currentUser = null;
  }

  getCurrentUser() {
    if (!this.currentUser) {
      const savedUser = localStorage.getItem("currentUser");
      this.currentUser = savedUser ? JSON.parse(savedUser) : null;
    }
    return this.currentUser;
  }
}

export const authService = new AuthService();