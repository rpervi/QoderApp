import api from './api';
import type { Candidate, PaginatedResponse, CommunicationLog } from '../types';

export const candidateService = {
  getCandidates: (params?: { page?: number; pageSize?: number; search?: string; status?: number }) =>
    api.get<PaginatedResponse<Candidate>>('/candidates', { params }).then((r) => r.data),

  getCandidate: (id: number) =>
    api.get<Candidate>(`/candidates/${id}`).then((r) => r.data),

  createCandidate: (data: any) =>
    api.post<Candidate>('/candidates', data).then((r) => r.data),

  updateCandidate: (id: number, data: any) =>
    api.put<Candidate>(`/candidates/${id}`, data).then((r) => r.data),

  updateResumeStatus: (candidateId: number, resumeId: number, data: { status: number; remarks?: string }) =>
    api.patch(`/candidates/${candidateId}/resumes/${resumeId}/status`, data).then((r) => r.data),

  sendCommunication: (candidateId: number, data: { type: number; subject?: string; body?: string; jobId?: number }) =>
    api.post(`/candidates/${candidateId}/communicate`, data).then((r) => r.data),

  getCommunications: (candidateId: number) =>
    api.get<CommunicationLog[]>(`/candidates/${candidateId}/communications`).then((r) => r.data),
};
