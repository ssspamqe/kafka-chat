import { apiService } from "./apiService";

class AuthService {
  constructor() {
    this.currentUser = null;
    this.STORAGE_KEY = "chatCurrentUser";
  }

  async login(username, tag) {
    try {
      if (!username) throw new Error("Username is required");

      console.log("Logging in with tag:", tag);

      const response = await apiService.sendRequest(
        `/user/${encodeURIComponent(username)}`,
        { username, tag },
        "POST",
        "MONGO"
      )

      console.log("Login response:", response);

      const user = response.user || {
        username: response.username,
        tag: tag || null,
        chats: ["global"],
      };

      this.currentUser = user;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed");
    }
  }

  async updateUserTag(tag) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const response = await apiService.sendRequest(
        `/tag/${user.username}`,
        { tag: tag || null },
        "POST",
        "MONGO"
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
          this.currentUser = savedUser;
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

  // updateCurrentUser(updatedUser) {
  //   this.currentUser = updatedUser;
  //   localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
  // }
}

export const authService = new AuthService();
