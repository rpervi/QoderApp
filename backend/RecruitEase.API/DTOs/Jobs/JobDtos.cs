using System.ComponentModel.DataAnnotations;
using RecruitEase.API.Models;

namespace RecruitEase.API.DTOs.Jobs;

public class CreateJobRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    [MaxLength(100)]
    public string? Department { get; set; }
    [MaxLength(200)]
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public JobType JobType { get; set; } = JobType.FullTime;
    public int? ExperienceMin { get; set; }
    public int? ExperienceMax { get; set; }
    [MaxLength(500)]
    public string? Skills { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Draft;
    public DateTime? ClosingDate { get; set; }
}

public class UpdateJobRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    [MaxLength(100)]
    public string? Department { get; set; }
    [MaxLength(200)]
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public JobType JobType { get; set; }
    public int? ExperienceMin { get; set; }
    public int? ExperienceMax { get; set; }
    [MaxLength(500)]
    public string? Skills { get; set; }
    public DateTime? ClosingDate { get; set; }
}

public class ChangeJobStatusRequest
{
    [Required]
    public JobStatus Status { get; set; }
}

public class JobListResponse
{
    public List<JobDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class JobDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Department { get; set; }
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string JobType { get; set; } = string.Empty;
    public int? ExperienceMin { get; set; }
    public int? ExperienceMax { get; set; }
    public string? Skills { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PostedDate { get; set; }
    public DateTime? ClosingDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public int CandidateCount { get; set; }
}
