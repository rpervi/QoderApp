using System.ComponentModel.DataAnnotations;
using RecruitEase.API.Models;

namespace RecruitEase.API.DTOs.Interviews;

public class ScheduleInterviewRequest
{
    [Required]
    public int CandidateId { get; set; }
    [Required]
    public int JobId { get; set; }
    [Required]
    public DateTime InterviewDate { get; set; }
    [Required]
    public string InterviewTime { get; set; } = string.Empty;
    public int Duration { get; set; } = 60;
    public InterviewType InterviewType { get; set; } = InterviewType.Phone;
    [MaxLength(500)]
    public string? MeetingLink { get; set; }
    [MaxLength(100)]
    public string? InterviewerName { get; set; }
    [EmailAddress, MaxLength(256)]
    public string? InterviewerEmail { get; set; }
    public string? Notes { get; set; }
}

public class UpdateInterviewRequest
{
    [Required]
    public DateTime InterviewDate { get; set; }
    [Required]
    public string InterviewTime { get; set; } = string.Empty;
    public int Duration { get; set; } = 60;
    public InterviewType InterviewType { get; set; }
    [MaxLength(500)]
    public string? MeetingLink { get; set; }
    [MaxLength(100)]
    public string? InterviewerName { get; set; }
    [EmailAddress, MaxLength(256)]
    public string? InterviewerEmail { get; set; }
    public string? Notes { get; set; }
}

public class UpdateInterviewStatusRequest
{
    [Required]
    public InterviewStatus Status { get; set; }
}

public class SubmitFeedbackRequest
{
    public string? Feedback { get; set; }
    [Range(1, 5)]
    public int? Rating { get; set; }
}

public class InterviewListResponse
{
    public List<InterviewDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class InterviewDto
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public int JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public DateTime InterviewDate { get; set; }
    public string InterviewTime { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string InterviewType { get; set; } = string.Empty;
    public string? MeetingLink { get; set; }
    public string? InterviewerName { get; set; }
    public string? InterviewerEmail { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Feedback { get; set; }
    public int? Rating { get; set; }
    public string? Notes { get; set; }
    public string ScheduledByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
