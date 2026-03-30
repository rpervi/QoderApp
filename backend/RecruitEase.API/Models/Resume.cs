namespace RecruitEase.API.Models;

public class Resume
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public string? FilePath { get; set; }
    public ResumeStatus Status { get; set; } = ResumeStatus.Received;
    public string? Source { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? Remarks { get; set; }

    public Candidate Candidate { get; set; } = null!;
    public Job Job { get; set; } = null!;
    public User? ReviewedBy { get; set; }
}
