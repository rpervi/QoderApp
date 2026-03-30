using System.ComponentModel.DataAnnotations;

namespace RecruitEase.API.DTOs.Naukri;

public class PostToNaukriRequest
{
    [Required]
    public int JobId { get; set; }
}

public class NaukriPostingDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string? NaukriJobCode { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime PostedAt { get; set; }
    public int ResponseCount { get; set; }
    public DateTime? LastSyncedAt { get; set; }
    public string PostedByName { get; set; } = string.Empty;
}

public class NaukriResumeDto
{
    public string CandidateName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string CurrentCompany { get; set; } = string.Empty;
    public string CurrentRole { get; set; } = string.Empty;
    public decimal ExperienceYears { get; set; }
    public string Skills { get; set; } = string.Empty;
    public string NaukriProfileUrl { get; set; } = string.Empty;
}
