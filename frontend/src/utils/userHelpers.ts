// Utility functions for working with user session data

interface User {
  id: string;
  email: string;
  created_at: string;
  access_token: string;
  refresh_token: string;
}

/**
 * Get the current user from localStorage
 * @returns User object or null if not found/invalid
 */
export const getCurrentUser = (): User | null => {
    try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) return null;
        
        return JSON.parse(savedUser);
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

/**
 * Get the current user's ID for use in API calls
 * @returns User ID string or null if not logged in
 */
export const getCurrentUserId = (): string | null => {
  const user = getCurrentUser();
  return user?.id || null;
};

/**
 * Get the current user's email for use in API calls
 * @returns User email string or null if not logged in
 */
export const getCurrentUserEmail = (): string | null => {
  const user = getCurrentUser();
  return user?.email || null;
};

/**
 * Get the current user's access token for authenticated API calls
 * @returns Access token string or null if not logged in
 */
export const getCurrentUserToken = (): string | null => {
  const user = getCurrentUser();
  return user?.access_token || null;
};

/**
 * Check if user is currently logged in
 * @returns boolean indicating if user is authenticated
 */
export const isUserLoggedIn = (): boolean => {
  const user = getCurrentUser();
  return user !== null && !!user.access_token;
};

/**
 * Create a data object with user information attached
 * Useful when creating tasks, projects, or other data that needs user attribution
 * @param data - The data object to attach user info to
 * @returns Data object with user information added
 */
export const withUserInfo = <T extends Record<string, any>>(data: T): T & { created_by?: string; user_id?: string } => {
  const userId = getCurrentUserId();
  const userEmail = getCurrentUserEmail();
  
  return {
    ...data,
    ...(userEmail && { created_by: userEmail }),
    ...(userId && { user_id: userId }),
  };
}; 