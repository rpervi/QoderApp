namespace RecruitEase.API.DTOs.Dashboard;

public class DashboardSummaryResponse
{
    public JobStatsDto JobStats { get; set; } = new();
    public CandidatePipelineDto CandidatePipeline { get; set; } = new();
    public InterviewTrackerDto InterviewTracker { get; set; } = new();
    public HiringMetricsDto HiringMetrics { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
    public List<UpcomingInterviewDto> UpcomingInterviews { get; set; } = new();
}

public class JobStatsDto
{
    public int TotalActiveJobs { get; set; }
    public int NewJobsThisWeek { get; set; }
    public int NewJobsThisMonth { get; set; }
    public int DraftJobs { get; set; }
    public int ClosedJobs { get; set; }
    public int FilledJobs { get; set; }
}

public class CandidatePipelineDto
{
    public int TotalReceived { get; set; }
    public int UnderReview { get; set; }
    public int Shortlisted { get; set; }
    public int Rejected { get; set; }
    public int InterviewScheduled { get; set; }
    public int Hired { get; set; }
}

public class InterviewTrackerDto
{
    public int TotalScheduled { get; set; }
    public int UpcomingCount { get; set; }
    public int CompletedCount { get; set; }
    public int PendingFeedback { get; set; }
    public int CancelledCount { get; set; }
    public int TodayCount { get; set; }
}

public class HiringMetricsDto
{
    public double AverageDaysToFill { get; set; }
    public double OfferAcceptanceRate { get; set; }
    public int TotalHired { get; set; }
    public int TotalOffered { get; set; }
}

public class RecentActivityDto
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class UpcomingInterviewDto
{
    public int InterviewId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public DateTime InterviewDate { get; set; }
    public string InterviewTime { get; set; } = string.Empty;
    public string InterviewType { get; set; } = string.Empty;
    public string? MeetingLink { get; set; }
}
