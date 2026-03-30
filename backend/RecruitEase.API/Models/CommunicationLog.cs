namespace RecruitEase.API.Models;

public class CommunicationLog
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public int? JobId { get; set; }
    public Guid SentByUserId { get; set; }
    public CommunicationType Type { get; set; } = CommunicationType.Custom;
    public string? Subject { get; set; }
    public string? Body { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public string? Status { get; set; } = "Sent";

    public Candidate Candidate { get; set; } = null!;
    public Job? Job { get; set; }
    public User SentBy { get; set; } = null!;
}
