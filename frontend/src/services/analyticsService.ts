import api from './api';
import {
  ApiResponse,
  DashboardSummary,
  CollectionTrend,
  StatusDistribution,
  WasteTypeData,
  MonthlyTrend,
} from '../types';

export const analyticsService = {
  async getDashboardSummary(
    timeframe = 'all'
  ): Promise<ApiResponse<DashboardSummary>> {
    const res = await api.get<ApiResponse<DashboardSummary>>(
      '/analytics/dashboard',
      {
        params: { timeframe },
      }
    );

    return res.data;
  },

  async getRequestsAnalytics(
    timeframe = 'all'
  ): Promise<
    ApiResponse<{
      statusDistribution: StatusDistribution[];
      collectionTrend: CollectionTrend[];
    }>
  > {
    const res = await api.get('/analytics/requests', {
      params: { timeframe },
    });

    return res.data;
  },

  async getWasteAnalytics(
    timeframe = 'all'
  ): Promise<
    ApiResponse<{
      wasteTypeData: WasteTypeData[];
      monthlyTrend: MonthlyTrend[];
    }>
  > {
    const res = await api.get('/analytics/waste', {
      params: { timeframe },
    });

    return res.data;
  },

  async getRecyclingAnalytics(
    timeframe = 'all'
  ): Promise<
    ApiResponse<{
      totalRecycledKg: number;
      totalProcessingKg: number;
      methodBreakdown: {
        method: string;
        quantityKg: number;
      }[];
      typeBreakdown: {
        wasteType: string;
        quantityKg: number;
      }[];
    }>
  > {
    const res = await api.get('/analytics/recycling', {
      params: { timeframe },
    });

    return res.data;
  },
};