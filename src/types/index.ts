export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiration: string;
  user: User;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
}

export interface Job {
  id: number;
  title: string;
  description?: string;
  department?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  experienceMin?: number;
  experienceMax?: number;
  skills?: string;
  status: string;
  postedDate?: string;
  closingDate?: string;
  isActive: boolean;
  createdAt: string;
  createdByName: string;
  candidateCount: number;
}

export interface CreateJobRequest {
  title: string;
  description?: string;
  department?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: number;
  experienceMin?: number;
  experienceMax?: number;
  skills?: string;
  status: number;
  closingDate?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Candidate {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  currentCompany?: string;
  currentRole?: string;
  experienceYears?: number;
  skills?: string;
  linkedInUrl?: string;
  notes?: string;
  createdAt: string;
  resumes: Resume[];
}

export interface Resume {
  id: number;
  jobId: number;
  jobTitle: string;
  filePath?: string;
  status: string;
  source?: string;
  submittedAt: string;
  reviewedByName?: string;
  reviewedAt?: string;
  remarks?: string;
}

export interface Interview {
  id: number;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  interviewDate: string;
  interviewTime: string;
  duration: number;
  interviewType: string;
  meetingLink?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  status: string;
  feedback?: string;
  rating?: number;
  notes?: string;
  scheduledByName: string;
  createdAt: string;
}

export interface DashboardSummary {
  jobStats: {
    totalActiveJobs: number;
    newJobsThisWeek: number;
    newJobsThisMonth: number;
    draftJobs: number;
    closedJobs: number;
    filledJobs: number;
  };
  candidatePipeline: {
    totalReceived: number;
    underReview: number;
    shortlisted: number;
    rejected: number;
    interviewScheduled: number;
    hired: number;
  };
  interviewTracker: {
    totalScheduled: number;
    upcomingCount: number;
    completedCount: number;
    pendingFeedback: number;
    cancelledCount: number;
    todayCount: number;
  };
  hiringMetrics: {
    averageDaysToFill: number;
    offerAcceptanceRate: number;
    totalHired: number;
    totalOffered: number;
  };
  recentActivities: {
    type: string;
    description: string;
    timestamp: string;
  }[];
  upcomingInterviews: {
    interviewId: number;
    candidateName: string;
    jobTitle: string;
    interviewDate: string;
    interviewTime: string;
    interviewType: string;
    meetingLink?: string;
  }[];
}

export interface NaukriPosting {
  id: number;
  jobId: number;
  jobTitle: string;
  naukriJobCode?: string;
  status: string;
  postedAt: string;
  responseCount: number;
  lastSyncedAt?: string;
  postedByName: string;
}

export interface NaukriResume {
  candidateName: string;
  email: string;
  phone: string;
  currentCompany: string;
  currentRole: string;
  experienceYears: number;
  skills: string;
  naukriProfileUrl: string;
}

export interface CommunicationLog {
  id: number;
  type: string;
  subject?: string;
  body?: string;
  sentAt: string;
  sentByName: string;
  status?: string;
  jobTitle?: string;
}
