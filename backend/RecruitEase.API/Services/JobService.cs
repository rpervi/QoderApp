using Microsoft.EntityFrameworkCore;
using RecruitEase.API.Data;
using RecruitEase.API.DTOs.Jobs;
using RecruitEase.API.Models;

namespace RecruitEase.API.Services;

public interface IJobService
{
    Task<JobListResponse> GetJobsAsync(int page, int pageSize, string? search, JobStatus? status, string? sortBy, string? sortDir);
    Task<JobDto> GetJobByIdAsync(int id);
    Task<JobDto> CreateJobAsync(CreateJobRequest request, Guid userId);
    Task<JobDto> UpdateJobAsync(int id, UpdateJobRequest request);
    Task DeleteJobAsync(int id);
    Task<JobDto> ChangeStatusAsync(int id, ChangeJobStatusRequest request);
}

public class JobService : IJobService
{
    private readonly AppDbContext _context;

    public JobService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<JobListResponse> GetJobsAsync(int page, int pageSize, string? search, JobStatus? status, string? sortBy, string? sortDir)
    {
        var query = _context.Jobs
            .Include(j => j.CreatedBy)
            .Where(j => j.IsActive);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(j => j.Title.Contains(search) || (j.Department != null && j.Department.Contains(search)) || (j.Location != null && j.Location.Contains(search)));

        if (status.HasValue)
            query = query.Where(j => j.Status == status.Value);

        query = (sortBy?.ToLower(), sortDir?.ToLower()) switch
        {
            ("title", "asc") => query.OrderBy(j => j.Title),
            ("title", _) => query.OrderByDescending(j => j.Title),
            ("date", "asc") => query.OrderBy(j => j.CreatedAt),
            _ => query.OrderByDescending(j => j.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var jobIds = items.Select(j => j.Id).ToList();
        var candidateCounts = await _context.Resumes
            .Where(r => jobIds.Contains(r.JobId))
            .GroupBy(r => r.JobId)
            .Select(g => new { JobId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.JobId, x => x.Count);

        return new JobListResponse
        {
            Items = items.Select(j => MapToDto(j, candidateCounts.GetValueOrDefault(j.Id, 0))).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<JobDto> GetJobByIdAsync(int id)
    {
        var job = await _context.Jobs
            .Include(j => j.CreatedBy)
            .FirstOrDefaultAsync(j => j.Id == id)
            ?? throw new KeyNotFoundException("Job not found.");

        var candidateCount = await _context.Resumes.CountAsync(r => r.JobId == id);
        return MapToDto(job, candidateCount);
    }

    public async Task<JobDto> CreateJobAsync(CreateJobRequest request, Guid userId)
    {
        var job = new Job
        {
            Title = request.Title,
            Description = request.Description,
            Department = request.Department,
            CreatedByUserId = userId,
            Location = request.Location,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            JobType = request.JobType,
            ExperienceMin = request.ExperienceMin,
            ExperienceMax = request.ExperienceMax,
            Skills = request.Skills,
            Status = request.Status,
            ClosingDate = request.ClosingDate,
            PostedDate = request.Status == JobStatus.Active ? DateTime.UtcNow : null
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        await _context.Entry(job).Reference(j => j.CreatedBy).LoadAsync();
        return MapToDto(job, 0);
    }

    public async Task<JobDto> UpdateJobAsync(int id, UpdateJobRequest request)
    {
        var job = await _context.Jobs.Include(j => j.CreatedBy).FirstOrDefaultAsync(j => j.Id == id)
            ?? throw new KeyNotFoundException("Job not found.");

        job.Title = request.Title;
        job.Description = request.Description;
        job.Department = request.Department;
        job.Location = request.Location;
        job.SalaryMin = request.SalaryMin;
        job.SalaryMax = request.SalaryMax;
        job.JobType = request.JobType;
        job.ExperienceMin = request.ExperienceMin;
        job.ExperienceMax = request.ExperienceMax;
        job.Skills = request.Skills;
        job.ClosingDate = request.ClosingDate;
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        var candidateCount = await _context.Resumes.CountAsync(r => r.JobId == id);
        return MapToDto(job, candidateCount);
    }

    public async Task DeleteJobAsync(int id)
    {
        var job = await _context.Jobs.FindAsync(id)
            ?? throw new KeyNotFoundException("Job not found.");

        job.IsActive = false;
        job.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<JobDto> ChangeStatusAsync(int id, ChangeJobStatusRequest request)
    {
        var job = await _context.Jobs.Include(j => j.CreatedBy).FirstOrDefaultAsync(j => j.Id == id)
            ?? throw new KeyNotFoundException("Job not found.");

        job.Status = request.Status;
        job.UpdatedAt = DateTime.UtcNow;

        if (request.Status == JobStatus.Active && !job.PostedDate.HasValue)
            job.PostedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        var candidateCount = await _context.Resumes.CountAsync(r => r.JobId == id);
        return MapToDto(job, candidateCount);
    }

    private static JobDto MapToDto(Job job, int candidateCount) => new()
    {
        Id = job.Id,
        Title = job.Title,
        Description = job.Description,
        Department = job.Department,
        Location = job.Location,
        SalaryMin = job.SalaryMin,
        SalaryMax = job.SalaryMax,
        JobType = job.JobType.ToString(),
        ExperienceMin = job.ExperienceMin,
        ExperienceMax = job.ExperienceMax,
        Skills = job.Skills,
        Status = job.Status.ToString(),
        PostedDate = job.PostedDate,
        ClosingDate = job.ClosingDate,
        IsActive = job.IsActive,
        CreatedAt = job.CreatedAt,
        CreatedByName = job.CreatedBy?.FullName ?? "",
        CandidateCount = candidateCount
    };
}
