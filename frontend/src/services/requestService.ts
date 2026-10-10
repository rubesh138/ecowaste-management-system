import api from './api';
import { ApiResponse, WasteRequest, WasteStatus } from '../types';

export const requestService = {
  async createRequest(data: {
    wasteType: string;
    quantity: string;
    unit?: string;
    preferredDate: string;
    address: string;
    description?: string;
    image?: string;
  }): Promise<ApiResponse<WasteRequest>> {
    const res = await api.post<ApiResponse<WasteRequest>>('/requests', data);
    return res.data;
  },

  async getRequests(params?: {
    status?: string;
    wasteType?: string;
    search?: string;
    sortBy?: string;
    order?: string;
  }): Promise<ApiResponse<WasteRequest[]>> {
    const res = await api.get<ApiResponse<WasteRequest[]>>('/requests', { params });
    return res.data;
  },

  async getRequestById(id: string): Promise<ApiResponse<WasteRequest>> {
    const res = await api.get<ApiResponse<WasteRequest>>(`/requests/${id}`);
    return res.data;
  },

  async updateRequest(
    id: string,
    data: Partial<WasteRequest>
  ): Promise<ApiResponse<WasteRequest>> {
    const res = await api.put<ApiResponse<WasteRequest>>(`/requests/${id}`, data);
    return res.data;
  },

  async deleteRequest(id: string): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(`/requests/${id}`);
    return res.data;
  },

  // Admin Operations
  async acceptRequest(
    id: string,
    data?: { adminResponse?: string; scheduledDate?: string }
  ): Promise<ApiResponse<WasteRequest>> {
    const res = await api.put<ApiResponse<WasteRequest>>(`/requests/${id}/accept`, data || {});
    return res.data;
  },

  async rejectRequest(
    id: string,
    data: { rejectionReason: string; adminResponse?: string }
  ): Promise<ApiResponse<WasteRequest>> {
    const res = await api.put<ApiResponse<WasteRequest>>(`/requests/${id}/reject`, data);
    return res.data;
  },

  async scheduleRequest(
    id: string,
    data: { scheduledDate: string; adminResponse?: string }
  ): Promise<ApiResponse<WasteRequest>> {
    const res = await api.put<ApiResponse<WasteRequest>>(`/requests/${id}/schedule`, data);
    return res.data;
  },

  async updateStatus(
    id: string,
    data: { status: WasteStatus; adminResponse?: string }
  ): Promise<ApiResponse<WasteRequest>> {
    const res = await api.put<ApiResponse<WasteRequest>>(`/requests/${id}/status`, data);
    return res.data;
  },

  async updateAdminResponse(
    id: string,
    adminResponse: string
  ): Promise<ApiResponse<WasteRequest>> {
    const res = await api.put<ApiResponse<WasteRequest>>(`/requests/${id}/response`, { adminResponse });
    return res.data;
  },
};
