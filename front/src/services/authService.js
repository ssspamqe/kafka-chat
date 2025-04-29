
import { apiService } from "./apiService";

class AuthService {
  constructor() {
    this.currentUser = null;
    this.STORAGE_KEY = "chatCurrentUser";
  }


async login(username, tag = null) {
  try {
    if (!username || username.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }

    const response = await apiService.sendRequest(
      `/user/${username}`,
      { username, tag }, 
      'POST',
      'MONGO'
    );

    const userData = {
      username,
      tag: tag || response?.tag || `#${Math.floor(Math.random() * 9000 + 1000)}`, // Гарантируем что тег будет
      chats: Array.isArray(response?.chats) ? response.chats : ['global']
    };

    this.currentUser = userData;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
async updateUserTag(tag) {
  try {
    const user = this.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    
    const response = await apiService.sendRequest(
      "/users/update-tag", 
      { 
        username: user.username,
        tag: tag || null
      },
      "PATCH"
    );
    
    this.currentUser = { ...user, tag };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
    
    return response;
  } catch (error) {
    console.error("Error updating tag:", error);
    throw error;
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

  updateCurrentUser(updatedUser) {
    this.currentUser = updatedUser;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
  }
}

export const authService = new AuthService();