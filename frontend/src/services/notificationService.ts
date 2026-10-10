import api from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const res = await api.get<ApiResponse<Notification[]>>('/notifications');
    return res.data;
  },

  async getUnreadCount(): Promise<{ success: boolean; unreadCount: number }> {
    const res = await api.get<{ success: boolean; unreadCount: number }>('/notifications/unread');
    return res.data;
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const res = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<ApiResponse> {
    const res = await api.put<ApiResponse>('/notifications/read-all');
    return res.data;
  },
};
