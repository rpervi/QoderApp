import api from './api';
import type { Interview, PaginatedResponse } from '../types';

export const interviewService = {
  getInterviews: (params?: { page?: number; pageSize?: number; status?: number; date?: string }) =>
    api.get<PaginatedResponse<Interview>>('/interviews', { params }).then((r) => r.data),

  getInterview: (id: number) =>
    api.get<Interview>(`/interviews/${id}`).then((r) => r.data),

  scheduleInterview: (data: any) =>
    api.post<Interview>('/interviews', data).then((r) => r.data),

  updateInterview: (id: number, data: any) =>
    api.put<Interview>(`/interviews/${id}`, data).then((r) => r.data),

  updateStatus: (id: number, status: number) =>
    api.patch<Interview>(`/interviews/${id}/status`, { status }).then((r) => r.data),

  submitFeedback: (id: number, data: { feedback?: string; rating?: number }) =>
    api.patch<Interview>(`/interviews/${id}/feedback`, data).then((r) => r.data),

  getUpcoming: () =>
    api.get<Interview[]>('/interviews/upcoming').then((r) => r.data),

  deleteInterview: (id: number) =>
    api.delete(`/interviews/${id}`),
};
