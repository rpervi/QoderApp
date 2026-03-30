namespace RecruitEase.API.Models;

public class Candidate
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
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
    public ICollection<CommunicationLog> CommunicationLogs { get; set; } = new List<CommunicationLog>();
}
