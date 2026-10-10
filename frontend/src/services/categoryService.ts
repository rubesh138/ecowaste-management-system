import api from './api';
import { ApiResponse, WasteCategory } from '../types';

export const categoryService = {
  async getCategories(all = false): Promise<ApiResponse<WasteCategory[]>> {
    const res = await api.get<ApiResponse<WasteCategory[]>>('/categories', {
      params: all ? { all: 'true' } : {},
    });
    return res.data;
  },

  async createCategory(data: Partial<WasteCategory>): Promise<ApiResponse<WasteCategory>> {
    const res = await api.post<ApiResponse<WasteCategory>>('/categories', data);
    return res.data;
  },

  async updateCategory(id: string, data: Partial<WasteCategory>): Promise<ApiResponse<WasteCategory>> {
    const res = await api.put<ApiResponse<WasteCategory>>(`/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/categories/${id}`);
    return res.data;
  },
};
