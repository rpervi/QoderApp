using Microsoft.EntityFrameworkCore;
using RecruitEase.API.Data;
using RecruitEase.API.DTOs.Interviews;
using RecruitEase.API.Models;

namespace RecruitEase.API.Services;

public interface IInterviewService
{
    Task<InterviewListResponse> GetInterviewsAsync(int page, int pageSize, InterviewStatus? status, DateTime? date);
    Task<InterviewDto> GetInterviewByIdAsync(int id);
    Task<InterviewDto> ScheduleInterviewAsync(ScheduleInterviewRequest request, Guid userId);
    Task<InterviewDto> UpdateInterviewAsync(int id, UpdateInterviewRequest request);
    Task<InterviewDto> UpdateStatusAsync(int id, UpdateInterviewStatusRequest request);
    Task<InterviewDto> SubmitFeedbackAsync(int id, SubmitFeedbackRequest request);
    Task<List<InterviewDto>> GetUpcomingInterviewsAsync();
    Task DeleteInterviewAsync(int id);
}

public class InterviewService : IInterviewService
{
    private readonly AppDbContext _context;

    public InterviewService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InterviewListResponse> GetInterviewsAsync(int page, int pageSize, InterviewStatus? status, DateTime? date)
    {
        var query = _context.Interviews
            .Include(i => i.Candidate)
            .Include(i => i.Job)
            .Include(i => i.ScheduledBy)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(i => i.Status == status.Value);

        if (date.HasValue)
            query = query.Where(i => i.InterviewDate == date.Value.Date);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(i => i.InterviewDate)
            .ThenBy(i => i.InterviewTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new InterviewListResponse
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<InterviewDto> GetInterviewByIdAsync(int id)
    {
        var interview = await _context.Interviews
            .Include(i => i.Candidate)
            .Include(i => i.Job)
            .Include(i => i.ScheduledBy)
            .FirstOrDefaultAsync(i => i.Id == id)
            ?? throw new KeyNotFoundException("Interview not found.");

        return MapToDto(interview);
    }

    public async Task<InterviewDto> ScheduleInterviewAsync(ScheduleInterviewRequest request, Guid userId)
    {
        var interview = new Interview
        {
            CandidateId = request.CandidateId,
            JobId = request.JobId,
            ScheduledByUserId = userId,
            InterviewDate = request.InterviewDate.Date,
            InterviewTime = TimeSpan.Parse(request.InterviewTime),
            Duration = request.Duration,
            InterviewType = request.InterviewType,
            MeetingLink = request.MeetingLink,
            InterviewerName = request.InterviewerName,
            InterviewerEmail = request.InterviewerEmail,
            Notes = request.Notes,
            Status = InterviewStatus.Scheduled
        };

        _context.Interviews.Add(interview);

        // Update resume status to InterviewScheduled
        var resume = await _context.Resumes
            .FirstOrDefaultAsync(r => r.CandidateId == request.CandidateId && r.JobId == request.JobId);
        if (resume != null && resume.Status == ResumeStatus.Shortlisted)
        {
            resume.Status = ResumeStatus.InterviewScheduled;
        }

        await _context.SaveChangesAsync();

        await _context.Entry(interview).Reference(i => i.Candidate).LoadAsync();
        await _context.Entry(interview).Reference(i => i.Job).LoadAsync();
        await _context.Entry(interview).Reference(i => i.ScheduledBy).LoadAsync();

        return MapToDto(interview);
    }

    public async Task<InterviewDto> UpdateInterviewAsync(int id, UpdateInterviewRequest request)
    {
        var interview = await _context.Interviews
            .Include(i => i.Candidate)
            .Include(i => i.Job)
            .Include(i => i.ScheduledBy)
            .FirstOrDefaultAsync(i => i.Id == id)
            ?? throw new KeyNotFoundException("Interview not found.");

        interview.InterviewDate = request.InterviewDate.Date;
        interview.InterviewTime = TimeSpan.Parse(request.InterviewTime);
        interview.Duration = request.Duration;
        interview.InterviewType = request.InterviewType;
        interview.MeetingLink = request.MeetingLink;
        interview.InterviewerName = request.InterviewerName;
        interview.InterviewerEmail = request.InterviewerEmail;
        interview.Notes = request.Notes;
        interview.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(interview);
    }

    public async Task<InterviewDto> UpdateStatusAsync(int id, UpdateInterviewStatusRequest request)
    {
        var interview = await _context.Interviews
            .Include(i => i.Candidate)
            .Include(i => i.Job)
            .Include(i => i.ScheduledBy)
            .FirstOrDefaultAsync(i => i.Id == id)
            ?? throw new KeyNotFoundException("Interview not found.");

        interview.Status = request.Status;
        interview.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(interview);
    }

    public async Task<InterviewDto> SubmitFeedbackAsync(int id, SubmitFeedbackRequest request)
    {
        var interview = await _context.Interviews
            .Include(i => i.Candidate)
            .Include(i => i.Job)
            .Include(i => i.ScheduledBy)
            .FirstOrDefaultAsync(i => i.Id == id)
            ?? throw new KeyNotFoundException("Interview not found.");

        interview.Feedback = request.Feedback;
        interview.Rating = request.Rating;
        interview.Status = InterviewStatus.Completed;
        interview.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(interview);
    }

    public async Task<List<InterviewDto>> GetUpcomingInterviewsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var nextWeek = today.AddDays(7);

        return await _context.Interviews
            .Include(i => i.Candidate)
            .Include(i => i.Job)
            .Include(i => i.ScheduledBy)
            .Where(i => i.InterviewDate >= today && i.InterviewDate <= nextWeek && i.Status == InterviewStatus.Scheduled)
            .OrderBy(i => i.InterviewDate)
            .ThenBy(i => i.InterviewTime)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task DeleteInterviewAsync(int id)
    {
        var interview = await _context.Interviews.FindAsync(id)
            ?? throw new KeyNotFoundException("Interview not found.");

        interview.Status = InterviewStatus.Cancelled;
        interview.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private static InterviewDto MapToDto(Interview i) => new()
    {
        Id = i.Id,
        CandidateId = i.CandidateId,
        CandidateName = i.Candidate.FullName,
        JobId = i.JobId,
        JobTitle = i.Job.Title,
        InterviewDate = i.InterviewDate,
        InterviewTime = i.InterviewTime.ToString(@"hh\:mm"),
        Duration = i.Duration,
        InterviewType = i.InterviewType.ToString(),
        MeetingLink = i.MeetingLink,
        InterviewerName = i.InterviewerName,
        InterviewerEmail = i.InterviewerEmail,
        Status = i.Status.ToString(),
        Feedback = i.Feedback,
        Rating = i.Rating,
        Notes = i.Notes,
        ScheduledByName = i.ScheduledBy.FullName,
        CreatedAt = i.CreatedAt
    };
}
