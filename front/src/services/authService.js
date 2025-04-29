// import { apiService } from "./apiService";

// class AuthService {
//   constructor() {
//     this.currentUser = null;
//     this.STORAGE_KEY = "chatCurrentUser";
//   }

  

//   async login(username) {
//     try {
//       if (!username || username.length < 3) {
//         throw new Error("Username must be at least 3 characters");
//       }

//       const response = await apiService.sendRequest(
//         `/user/${username}`,
//         {},
//         'POST',
//         'MONGO'
//       );

//       const userData = {
//         username,
//         tag: response?.tag || null,
//         chats: Array.isArray(response?.chats) ? response.chats : ['global']
//       };

//       this.currentUser = userData;
//       localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
      
//       return userData;
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw new Error(
//         error.message.includes('already exists') 
//           ? `Username "${username}" is already taken`
//           : 'Login failed. Please try again later.'
//       );
//     }
//   }

//   logout() {
//     this.currentUser = null;
//     localStorage.removeItem(this.STORAGE_KEY);
//   }

//   getCurrentUser() {
//     if (!this.currentUser) {
//       try {
//         const savedUser = localStorage.getItem(this.STORAGE_KEY);
//         if (savedUser) {
//           this.currentUser = JSON.parse(savedUser);
//         }
//       } catch (e) {
//         console.error("Failed to parse user data from localStorage", e);
//         localStorage.removeItem(this.STORAGE_KEY);
//       }
//     }
//     return this.currentUser;
//   }

//   isAuthenticated() {
//     return !!this.getCurrentUser();
//   }
  
// }
// const updateUserTag = async (newTag) => {
//   try {
//     const response = await apiService.sendRequest(
//       "/users/update-tag",
//       { username: getCurrentUser().username, tag: newTag },
//       "POST"
//     );
    
//     // Обновляем локальные данные пользователя
//     const updatedUser = { ...getCurrentUser(), tag: newTag };
//     localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
//     return response;
//   } catch (error) {
//     console.error("Error updating user tag:", error);
//     throw error;
//   }
//   async updateUserTag(newTag) {
//     try {
//       const user = this.getCurrentUser();
//       if (!user) {
//         throw new Error("User not authenticated");
//       }

//       const response = await apiService.sendRequest(
//         "/users/update-tag",
//         { username: user.username, tag: newTag },
//         "POST"
//       );
      
//       // Обновляем и локальные данные пользователя
//       this.currentUser = { ...user, tag: newTag };
//       localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
      
//       return response;
//     } catch (error) {
//       console.error("Error updating user tag:", error);
//       throw error;
//     }
//   }
// };

// export const authService = new AuthService();


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

  async updateUserTag(newTag) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await apiService.sendRequest(
        "/users/update-tag",
        { username: user.username, tag: newTag },
        "POST"
      );
      
      // Обновляем локальные данные пользователя
      this.currentUser = { ...user, tag: newTag };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
      
      return response;
    } catch (error) {
      console.error("Error updating user tag:", error);
      throw error;
    }
  }
  updateCurrentUser(updatedUser) {
    this.currentUser = updatedUser;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
  }
}

export const authService = new AuthService();