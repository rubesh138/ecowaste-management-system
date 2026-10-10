import api from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async register(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>('/auth/login', data);
    return res.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async updateProfile(data: {
    name: string;
    phone: string;
    address: string;
  }): Promise<ApiResponse<User>> {
    const res = await api.put<ApiResponse<User>>('/auth/profile', data);
    return res.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const res = await api.put<ApiResponse>('/auth/change-password', data);
    return res.data;
  },
};
