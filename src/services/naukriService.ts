import api from './api';
import type { NaukriPosting, NaukriResume } from '../types';

export const naukriService = {
  postJob: (jobId: number) =>
    api.post<NaukriPosting>('/naukri/post-job', { jobId }).then((r) => r.data),

  getPostings: () =>
    api.get<NaukriPosting[]>('/naukri/postings').then((r) => r.data),

  getResumesForPosting: (postingId: number) =>
    api.get<NaukriResume[]>(`/naukri/postings/${postingId}/resumes`).then((r) => r.data),

  syncPosting: (postingId: number) =>
    api.post<NaukriPosting>(`/naukri/postings/${postingId}/sync`).then((r) => r.data),
};
