import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCitizen: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }) => Promise<User>;
  logout: () => void;
  updateUserProfile: (data: {
    name: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  // ============================================================
  // LOAD SAVED USER
  // ============================================================

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser =
        localStorage.getItem('smart_waste_user');

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error(
        'Failed to load saved user:',
        error
      );
      return null;
    }
  });

  // ============================================================
  // LOAD SAVED TOKEN
  // ============================================================

  const [token, setToken] = useState<string | null>(
    () => {
      return localStorage.getItem(
        'smart_waste_token'
      );
    }
  );

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  // ============================================================
  // SAVE USER EVERYWHERE
  // ============================================================

  const saveUser = (userData: User) => {
    setUser(userData);

    localStorage.setItem(
      'smart_waste_user',
      JSON.stringify(userData)
    );
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(
      'smart_waste_token'
    );

    localStorage.removeItem(
      'smart_waste_user'
    );
  };

  // ============================================================
  // GET CURRENT USER FROM BACKEND
  // ============================================================

  const refreshUser = async () => {
    try {
      const storedToken =
        localStorage.getItem(
          'smart_waste_token'
        );

      if (!storedToken) {
        return;
      }

      const res =
        await authService.getMe();

      if (res.data) {

        /*
         * Merge the current backend user with
         * the existing user.
         *
         * This prevents profilePhoto from disappearing
         * when one response does not contain it.
         */
        const mergedUser = {
          ...(user || {}),
          ...res.data,

          profilePhoto:
            res.data.profilePhoto ||
            (user as any)?.profilePhoto ||
            '',
        } as User;

        saveUser(mergedUser);
      }

    } catch (error) {
      console.error(
        'Failed to refresh user:',
        error
      );
    }
  };

  // ============================================================
  // RESTORE SESSION ON APP LOAD
  // ============================================================

  useEffect(() => {
    const initAuth = async () => {
      const storedToken =
        localStorage.getItem(
          'smart_waste_token'
        );

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res =
          await authService.getMe();

        if (res.data) {

          /*
           * Keep any saved profilePhoto if the
           * backend response does not contain it.
           */
          let savedUser: any = null;

          try {
            const storedUser =
              localStorage.getItem(
                'smart_waste_user'
              );

            savedUser = storedUser
              ? JSON.parse(storedUser)
              : null;
          } catch {
            savedUser = null;
          }

          const mergedUser = {
            ...(savedUser || {}),
            ...res.data,

            profilePhoto:
              res.data.profilePhoto ||
              savedUser?.profilePhoto ||
              '',
          } as User;

          setUser(mergedUser);

          localStorage.setItem(
            'smart_waste_user',
            JSON.stringify(mergedUser)
          );

          setToken(storedToken);
        }

      } catch (error) {
        console.warn(
          'Failed to restore session:',
          error
        );

        logout();
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (
    email: string,
    password: string
  ): Promise<User> => {

    setIsLoading(true);

    try {
      const res =
        await authService.login({
          email,
          password,
        });

      if (
        !res.data ||
        !res.data.token
      ) {
        throw new Error(
          'Invalid login response from server'
        );
      }

      const userData = res.data;
      const userToken = res.data.token;

      // Save token first
      setToken(userToken);

      localStorage.setItem(
        'smart_waste_token',
        userToken
      );

      /*
       * Save initial login user
       */
      saveUser(userData);

      /*
       * Fetch latest user from backend.
       * This is important because the employee photo
       * is stored in MongoDB.
       */
      try {
        const meRes =
          await authService.getMe();

        if (meRes.data) {

          const latestUser = {
            ...userData,
            ...meRes.data,

            profilePhoto:
              meRes.data.profilePhoto ||
              userData.profilePhoto ||
              '',
          } as User;

          saveUser(latestUser);

          return latestUser;
        }
      } catch (error) {
        console.warn(
          'Could not fetch latest user after login:',
          error
        );
      }

      return userData;

    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }): Promise<User> => {

    setIsLoading(true);

    try {
      const res =
        await authService.register(data);

      if (
        !res.data ||
        !res.data.token
      ) {
        throw new Error(
          'Invalid registration response from server'
        );
      }

      const userData = res.data;
      const userToken = res.data.token;

      setUser(userData);
      setToken(userToken);

      localStorage.setItem(
        'smart_waste_token',
        userToken
      );

      localStorage.setItem(
        'smart_waste_user',
        JSON.stringify(userData)
      );

      return userData;

    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // UPDATE USER PROFILE
  // ============================================================

  const updateUserProfile = async (data: {
    name: string;
    phone: string;
    address: string;
  }) => {

    const res =
      await authService.updateProfile(data);

    if (res.data) {

      const updatedUser = {
        ...(user || {}),
        ...res.data,

        /*
         * Keep existing profile photo.
         */
        profilePhoto:
          res.data.profilePhoto ||
          (user as any)?.profilePhoto ||
          '',
      } as User;

      saveUser(updatedUser);
    }
  };

  // ============================================================
  // AUTH STATUS
  // ============================================================

  const isAuthenticated =
    !!token && !!user;

  const isAdmin =
    user?.role === 'admin';

  const isCitizen =
    user?.role === 'citizen';

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isCitizen,
        login,
        register,
        logout,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// USE AUTH HOOK
// ============================================================

export const useAuth =
  (): AuthContextType => {

    const context =
      useContext(AuthContext);

    if (!context) {
      throw new Error(
        'useAuth must be used within an AuthProvider'
      );
    }

    return context;
  };