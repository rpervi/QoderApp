using System.ComponentModel.DataAnnotations;
using RecruitEase.API.Models;

namespace RecruitEase.API.DTOs.Candidates;

public class CreateCandidateRequest
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;
    [EmailAddress, MaxLength(256)]
    public string? Email { get; set; }
    [MaxLength(20)]
    public string? Phone { get; set; }
    [MaxLength(200)]
    public string? CurrentCompany { get; set; }
    [MaxLength(200)]
    public string? CurrentRole { get; set; }
    public decimal? ExperienceYears { get; set; }
    [MaxLength(500)]
    public string? Skills { get; set; }
    [MaxLength(500)]
    public string? LinkedInUrl { get; set; }
    public string? Notes { get; set; }
    public int? JobId { get; set; }
    public string? Source { get; set; }
}

public class UpdateCandidateRequest
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;
    [EmailAddress, MaxLength(256)]
    public string? Email { get; set; }
    [MaxLength(20)]
    public string? Phone { get; set; }
    [MaxLength(200)]
    public string? CurrentCompany { get; set; }
    [MaxLength(200)]
    public string? CurrentRole { get; set; }
    public decimal? ExperienceYears { get; set; }
    [MaxLength(500)]
    public string? Skills { get; set; }
    [MaxLength(500)]
    public string? LinkedInUrl { get; set; }
    public string? Notes { get; set; }
}

public class UpdateResumeStatusRequest
{
    [Required]
    public ResumeStatus Status { get; set; }
    public string? Remarks { get; set; }
}

public class SendCommunicationRequest
{
    [Required]
    public CommunicationType Type { get; set; }
    [MaxLength(200)]
    public string? Subject { get; set; }
    public string? Body { get; set; }
    public int? JobId { get; set; }
}

public class CandidateListResponse
{
    public List<CandidateDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class CandidateDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? CurrentCompany { get; set; }
    public string? CurrentRole { get; set; }
    public decimal? ExperienceYears { get; set; }
    public string? Skills { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ResumeDto> Resumes { get; set; } = new();
}

public class ResumeDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string? FilePath { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Source { get; set; }
    public DateTime SubmittedAt { get; set; }
    public string? ReviewedByName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? Remarks { get; set; }
}

public class CommunicationLogDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? Body { get; set; }
    public DateTime SentAt { get; set; }
    public string SentByName { get; set; } = string.Empty;
    public string? Status { get; set; }
    public string? JobTitle { get; set; }
}
