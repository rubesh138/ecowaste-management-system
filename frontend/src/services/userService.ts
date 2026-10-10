import api from './api';
import { ApiResponse, User } from '../types';

export const userService = {
  async getUsers(params?: { search?: string; status?: string }): Promise<ApiResponse<User[]>> {
    const res = await api.get<ApiResponse<User[]>>('/users', { params });
    return res.data;
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },

  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<User>> {
    const res = await api.put<ApiResponse<User>>(`/users/${id}/status`, { status });
    return res.data;
  },
};
