import api from './api';
import type { Job, PaginatedResponse, CreateJobRequest } from '../types';

export const jobService = {
  getJobs: (params?: { page?: number; pageSize?: number; search?: string; status?: number; sortBy?: string; sortDir?: string }) =>
    api.get<PaginatedResponse<Job>>('/jobs', { params }).then((r) => r.data),

  getJob: (id: number) =>
    api.get<Job>(`/jobs/${id}`).then((r) => r.data),

  createJob: (data: CreateJobRequest) =>
    api.post<Job>('/jobs', data).then((r) => r.data),

  updateJob: (id: number, data: Partial<CreateJobRequest>) =>
    api.put<Job>(`/jobs/${id}`, data).then((r) => r.data),

  deleteJob: (id: number) =>
    api.delete(`/jobs/${id}`),

  changeStatus: (id: number, status: number) =>
    api.patch<Job>(`/jobs/${id}/status`, { status }).then((r) => r.data),

  getCandidatesForJob: (id: number) =>
    api.get(`/jobs/${id}/candidates`).then((r) => r.data),
};
