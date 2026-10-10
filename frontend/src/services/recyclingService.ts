import api from './api';
import {
  ApiResponse,
  RecyclingRecord,
  RecyclingStatus,
  WasteInventory,
} from '../types';

export const recyclingService = {
  async getRecyclingRecords(params?: {
    wasteType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<RecyclingRecord[]>> {
    const res = await api.get<ApiResponse<RecyclingRecord[]>>(
      '/recycling',
      { params }
    );

    return res.data;
  },

  async getWasteInventory(): Promise<
    ApiResponse<WasteInventory[]>
  > {
    const res = await api.get<ApiResponse<WasteInventory[]>>(
      '/recycling/inventory'
    );

    return res.data;
  },

  async createRecyclingRecord(data: {
    wasteType: string;
    quantity: number;
    unit?: string;
    method: string;
    status?: RecyclingStatus;
    notes?: string;
    date?: string;
  }): Promise<ApiResponse<RecyclingRecord>> {
    const res = await api.post<ApiResponse<RecyclingRecord>>(
      '/recycling',
      data
    );

    return res.data;
  },

  async updateRecyclingRecord(
    id: string,
    data: Partial<RecyclingRecord>
  ): Promise<ApiResponse<RecyclingRecord>> {
    const res = await api.put<ApiResponse<RecyclingRecord>>(
      `/recycling/${id}`,
      data
    );

    return res.data;
  },

  async deleteRecyclingRecord(
    id: string
  ): Promise<ApiResponse> {
    const res = await api.delete<ApiResponse>(
      `/recycling/${id}`
    );

    return res.data;
  },
};