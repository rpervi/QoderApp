using Microsoft.EntityFrameworkCore;
using RecruitEase.API.Data;
using RecruitEase.API.DTOs.Candidates;
using RecruitEase.API.Models;

namespace RecruitEase.API.Services;

public interface ICandidateService
{
    Task<CandidateListResponse> GetCandidatesAsync(int page, int pageSize, string? search, ResumeStatus? status);
    Task<CandidateDto> GetCandidateByIdAsync(int id);
    Task<CandidateDto> CreateCandidateAsync(CreateCandidateRequest request);
    Task<CandidateDto> UpdateCandidateAsync(int id, UpdateCandidateRequest request);
    Task<ResumeDto> UpdateResumeStatusAsync(int candidateId, int resumeId, UpdateResumeStatusRequest request, Guid userId);
    Task<CommunicationLogDto> SendCommunicationAsync(int candidateId, SendCommunicationRequest request, Guid userId);
    Task<List<CommunicationLogDto>> GetCommunicationsAsync(int candidateId);
    Task<List<CandidateDto>> GetCandidatesForJobAsync(int jobId);
}

public class CandidateService : ICandidateService
{
    private readonly AppDbContext _context;

    public CandidateService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CandidateListResponse> GetCandidatesAsync(int page, int pageSize, string? search, ResumeStatus? status)
    {
        var query = _context.Candidates.AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(c => c.FullName.Contains(search) || (c.Skills != null && c.Skills.Contains(search)) || (c.Email != null && c.Email.Contains(search)));

        if (status.HasValue)
            query = query.Where(c => c.Resumes.Any(r => r.Status == status.Value));

        var totalCount = await query.CountAsync();
        var items = await query
            .Include(c => c.Resumes).ThenInclude(r => r.Job)
            .Include(c => c.Resumes).ThenInclude(r => r.ReviewedBy)
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new CandidateListResponse
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CandidateDto> GetCandidateByIdAsync(int id)
    {
        var candidate = await _context.Candidates
            .Include(c => c.Resumes).ThenInclude(r => r.Job)
            .Include(c => c.Resumes).ThenInclude(r => r.ReviewedBy)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException("Candidate not found.");

        return MapToDto(candidate);
    }

    public async Task<CandidateDto> CreateCandidateAsync(CreateCandidateRequest request)
    {
        var candidate = new Candidate
        {
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            CurrentCompany = request.CurrentCompany,
            CurrentRole = request.CurrentRole,
            ExperienceYears = request.ExperienceYears,
            Skills = request.Skills,
            LinkedInUrl = request.LinkedInUrl,
            Notes = request.Notes
        };

        _context.Candidates.Add(candidate);

        if (request.JobId.HasValue)
        {
            var resume = new Resume
            {
                Candidate = candidate,
                JobId = request.JobId.Value,
                Source = request.Source ?? "Direct",
                Status = ResumeStatus.Received
            };
            _context.Resumes.Add(resume);
        }

        await _context.SaveChangesAsync();

        return await GetCandidateByIdAsync(candidate.Id);
    }

    public async Task<CandidateDto> UpdateCandidateAsync(int id, UpdateCandidateRequest request)
    {
        var candidate = await _context.Candidates.FindAsync(id)
            ?? throw new KeyNotFoundException("Candidate not found.");

        candidate.FullName = request.FullName;
        candidate.Email = request.Email;
        candidate.Phone = request.Phone;
        candidate.CurrentCompany = request.CurrentCompany;
        candidate.CurrentRole = request.CurrentRole;
        candidate.ExperienceYears = request.ExperienceYears;
        candidate.Skills = request.Skills;
        candidate.LinkedInUrl = request.LinkedInUrl;
        candidate.Notes = request.Notes;

        await _context.SaveChangesAsync();
        return await GetCandidateByIdAsync(id);
    }

    public async Task<ResumeDto> UpdateResumeStatusAsync(int candidateId, int resumeId, UpdateResumeStatusRequest request, Guid userId)
    {
        var resume = await _context.Resumes
            .Include(r => r.Job)
            .Include(r => r.ReviewedBy)
            .FirstOrDefaultAsync(r => r.Id == resumeId && r.CandidateId == candidateId)
            ?? throw new KeyNotFoundException("Resume not found.");

        resume.Status = request.Status;
        resume.Remarks = request.Remarks;
        resume.ReviewedByUserId = userId;
        resume.ReviewedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ResumeDto
        {
            Id = resume.Id,
            JobId = resume.JobId,
            JobTitle = resume.Job.Title,
            FilePath = resume.FilePath,
            Status = resume.Status.ToString(),
            Source = resume.Source,
            SubmittedAt = resume.SubmittedAt,
            ReviewedByName = resume.ReviewedBy?.FullName,
            ReviewedAt = resume.ReviewedAt,
            Remarks = resume.Remarks
        };
    }

    public async Task<CommunicationLogDto> SendCommunicationAsync(int candidateId, SendCommunicationRequest request, Guid userId)
    {
        var candidate = await _context.Candidates.FindAsync(candidateId)
            ?? throw new KeyNotFoundException("Candidate not found.");

        var log = new CommunicationLog
        {
            CandidateId = candidateId,
            JobId = request.JobId,
            SentByUserId = userId,
            Type = request.Type,
            Subject = request.Subject,
            Body = request.Body
        };

        _context.CommunicationLogs.Add(log);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);
        Job? job = request.JobId.HasValue ? await _context.Jobs.FindAsync(request.JobId.Value) : null;

        return new CommunicationLogDto
        {
            Id = log.Id,
            Type = log.Type.ToString(),
            Subject = log.Subject,
            Body = log.Body,
            SentAt = log.SentAt,
            SentByName = user?.FullName ?? "",
            Status = log.Status,
            JobTitle = job?.Title
        };
    }

    public async Task<List<CommunicationLogDto>> GetCommunicationsAsync(int candidateId)
    {
        return await _context.CommunicationLogs
            .Include(c => c.SentBy)
            .Include(c => c.Job)
            .Where(c => c.CandidateId == candidateId)
            .OrderByDescending(c => c.SentAt)
            .Select(c => new CommunicationLogDto
            {
                Id = c.Id,
                Type = c.Type.ToString(),
                Subject = c.Subject,
                Body = c.Body,
                SentAt = c.SentAt,
                SentByName = c.SentBy.FullName,
                Status = c.Status,
                JobTitle = c.Job != null ? c.Job.Title : null
            })
            .ToListAsync();
    }

    public async Task<List<CandidateDto>> GetCandidatesForJobAsync(int jobId)
    {
        var candidates = await _context.Candidates
            .Include(c => c.Resumes.Where(r => r.JobId == jobId)).ThenInclude(r => r.Job)
            .Include(c => c.Resumes.Where(r => r.JobId == jobId)).ThenInclude(r => r.ReviewedBy)
            .Where(c => c.Resumes.Any(r => r.JobId == jobId))
            .OrderByDescending(c => c.Resumes.Where(r => r.JobId == jobId).Max(r => r.SubmittedAt))
            .ToListAsync();

        return candidates.Select(MapToDto).ToList();
    }

    private static CandidateDto MapToDto(Candidate c) => new()
    {
        Id = c.Id,
        FullName = c.FullName,
        Email = c.Email,
        Phone = c.Phone,
        CurrentCompany = c.CurrentCompany,
        CurrentRole = c.CurrentRole,
        ExperienceYears = c.ExperienceYears,
        Skills = c.Skills,
        LinkedInUrl = c.LinkedInUrl,
        Notes = c.Notes,
        CreatedAt = c.CreatedAt,
        Resumes = c.Resumes.Select(r => new ResumeDto
        {
            Id = r.Id,
            JobId = r.JobId,
            JobTitle = r.Job.Title,
            FilePath = r.FilePath,
            Status = r.Status.ToString(),
            Source = r.Source,
            SubmittedAt = r.SubmittedAt,
            ReviewedByName = r.ReviewedBy?.FullName,
            ReviewedAt = r.ReviewedAt,
            Remarks = r.Remarks
        }).ToList()
    };
}
