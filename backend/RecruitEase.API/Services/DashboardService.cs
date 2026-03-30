using Microsoft.EntityFrameworkCore;
using RecruitEase.API.Data;
using RecruitEase.API.DTOs.Dashboard;
using RecruitEase.API.Models;

namespace RecruitEase.API.Services;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync();
}

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync()
    {
        var now = DateTime.UtcNow;
        var weekAgo = now.AddDays(-7);
        var monthAgo = now.AddDays(-30);
        var today = now.Date;

        var jobStats = new JobStatsDto
        {
            TotalActiveJobs = await _context.Jobs.CountAsync(j => j.Status == JobStatus.Active && j.IsActive),
            NewJobsThisWeek = await _context.Jobs.CountAsync(j => j.CreatedAt >= weekAgo),
            NewJobsThisMonth = await _context.Jobs.CountAsync(j => j.CreatedAt >= monthAgo),
            DraftJobs = await _context.Jobs.CountAsync(j => j.Status == JobStatus.Draft && j.IsActive),
            ClosedJobs = await _context.Jobs.CountAsync(j => j.Status == JobStatus.Closed),
            FilledJobs = await _context.Jobs.CountAsync(j => j.Status == JobStatus.Filled)
        };

        var resumeStatuses = await _context.Resumes
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var candidatePipeline = new CandidatePipelineDto
        {
            TotalReceived = resumeStatuses.Sum(r => r.Count),
            UnderReview = resumeStatuses.FirstOrDefault(r => r.Status == ResumeStatus.UnderReview)?.Count ?? 0,
            Shortlisted = resumeStatuses.FirstOrDefault(r => r.Status == ResumeStatus.Shortlisted)?.Count ?? 0,
            Rejected = resumeStatuses.FirstOrDefault(r => r.Status == ResumeStatus.Rejected)?.Count ?? 0,
            InterviewScheduled = resumeStatuses.FirstOrDefault(r => r.Status == ResumeStatus.InterviewScheduled)?.Count ?? 0,
            Hired = resumeStatuses.FirstOrDefault(r => r.Status == ResumeStatus.Hired)?.Count ?? 0
        };

        var interviewStatuses = await _context.Interviews
            .GroupBy(i => i.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var interviewTracker = new InterviewTrackerDto
        {
            TotalScheduled = interviewStatuses.Sum(i => i.Count),
            UpcomingCount = await _context.Interviews.CountAsync(i => i.InterviewDate >= today && i.Status == InterviewStatus.Scheduled),
            CompletedCount = interviewStatuses.FirstOrDefault(i => i.Status == InterviewStatus.Completed)?.Count ?? 0,
            PendingFeedback = interviewStatuses.FirstOrDefault(i => i.Status == InterviewStatus.PendingFeedback)?.Count ?? 0,
            CancelledCount = interviewStatuses.FirstOrDefault(i => i.Status == InterviewStatus.Cancelled)?.Count ?? 0,
            TodayCount = await _context.Interviews.CountAsync(i => i.InterviewDate == today && i.Status == InterviewStatus.Scheduled)
        };

        var totalHired = await _context.Resumes.CountAsync(r => r.Status == ResumeStatus.Hired);
        var totalShortlisted = await _context.Resumes.CountAsync(r => r.Status == ResumeStatus.Shortlisted || r.Status == ResumeStatus.Hired);

        var filledJobs = await _context.Jobs
            .Where(j => j.Status == JobStatus.Filled && j.PostedDate.HasValue)
            .Select(j => EF.Functions.DateDiffDay(j.PostedDate!.Value, j.UpdatedAt))
            .ToListAsync();

        var hiringMetrics = new HiringMetricsDto
        {
            TotalHired = totalHired,
            TotalOffered = totalShortlisted,
            OfferAcceptanceRate = totalShortlisted > 0 ? Math.Round((double)totalHired / totalShortlisted * 100, 1) : 0,
            AverageDaysToFill = filledJobs.Count > 0 ? Math.Round(filledJobs.Average(), 1) : 0
        };

        var upcomingInterviews = await _context.Interviews
            .Include(i => i.Candidate)
            .Include(i => i.Job)
            .Where(i => i.InterviewDate >= today && i.Status == InterviewStatus.Scheduled)
            .OrderBy(i => i.InterviewDate)
            .ThenBy(i => i.InterviewTime)
            .Take(5)
            .Select(i => new UpcomingInterviewDto
            {
                InterviewId = i.Id,
                CandidateName = i.Candidate.FullName,
                JobTitle = i.Job.Title,
                InterviewDate = i.InterviewDate,
                InterviewTime = i.InterviewTime.ToString(@"hh\:mm"),
                InterviewType = i.InterviewType.ToString(),
                MeetingLink = i.MeetingLink
            })
            .ToListAsync();

        var recentActivities = new List<RecentActivityDto>();

        var recentJobs = await _context.Jobs
            .OrderByDescending(j => j.CreatedAt)
            .Take(3)
            .Select(j => new RecentActivityDto
            {
                Type = "job",
                Description = $"Job '{j.Title}' was created",
                Timestamp = j.CreatedAt
            })
            .ToListAsync();

        var recentResumes = await _context.Resumes
            .Include(r => r.Candidate)
            .Include(r => r.Job)
            .OrderByDescending(r => r.SubmittedAt)
            .Take(3)
            .Select(r => new RecentActivityDto
            {
                Type = "resume",
                Description = $"{r.Candidate.FullName} applied for '{r.Job.Title}'",
                Timestamp = r.SubmittedAt
            })
            .ToListAsync();

        var recentInterviews = await _context.Interviews
            .Include(i => i.Candidate)
            .Where(i => i.Status == InterviewStatus.Completed)
            .OrderByDescending(i => i.UpdatedAt)
            .Take(3)
            .Select(i => new RecentActivityDto
            {
                Type = "interview",
                Description = $"Interview completed with {i.Candidate.FullName}",
                Timestamp = i.UpdatedAt
            })
            .ToListAsync();

        recentActivities.AddRange(recentJobs);
        recentActivities.AddRange(recentResumes);
        recentActivities.AddRange(recentInterviews);
        recentActivities = recentActivities.OrderByDescending(a => a.Timestamp).Take(10).ToList();

        return new DashboardSummaryResponse
        {
            JobStats = jobStats,
            CandidatePipeline = candidatePipeline,
            InterviewTracker = interviewTracker,
            HiringMetrics = hiringMetrics,
            UpcomingInterviews = upcomingInterviews,
            RecentActivities = recentActivities
        };
    }
}
