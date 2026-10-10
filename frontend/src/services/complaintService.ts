import api from './api';
import { ApiResponse, Complaint, ComplaintCategory, ComplaintStatus } from '../types';

export const complaintService = {
  async createComplaint(data: {
    category: ComplaintCategory;
    description: string;
    address: string;
    image?: string;
  }): Promise<ApiResponse<Complaint>> {
    const res = await api.post<ApiResponse<Complaint>>('/complaints', data);
    return res.data;
  },

  async getComplaints(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<Complaint[]>> {
    const res = await api.get<ApiResponse<Complaint[]>>('/complaints', { params });
    return res.data;
  },

  async getComplaintById(id: string): Promise<ApiResponse<Complaint>> {
    const res = await api.get<ApiResponse<Complaint>>(`/complaints/${id}`);
    return res.data;
  },

  async updateComplaint(
    id: string,
    data: { status?: ComplaintStatus; adminResponse?: string }
  ): Promise<ApiResponse<Complaint>> {
    const res = await api.put<ApiResponse<Complaint>>(`/complaints/${id}`, data);
    return res.data;
  },
};
