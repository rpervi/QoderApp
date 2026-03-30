namespace RecruitEase.API.Models;

public class Interview
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public Guid ScheduledByUserId { get; set; }
    public DateTime InterviewDate { get; set; }
    public TimeSpan InterviewTime { get; set; }
    public int Duration { get; set; } = 60;
    public InterviewType InterviewType { get; set; } = InterviewType.Phone;
    public string? MeetingLink { get; set; }
    public string? InterviewerName { get; set; }
    public string? InterviewerEmail { get; set; }
    public InterviewStatus Status { get; set; } = InterviewStatus.Scheduled;
    public string? Feedback { get; set; }
    public int? Rating { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Candidate Candidate { get; set; } = null!;
    public Job Job { get; set; } = null!;
    public User ScheduledBy { get; set; } = null!;
}
