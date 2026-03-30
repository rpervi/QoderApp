namespace RecruitEase.API.Models;

public class NaukriPosting
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public Guid PostedByUserId { get; set; }
    public string? NaukriJobCode { get; set; }
    public NaukriPostingStatus Status { get; set; } = NaukriPostingStatus.Pending;
    public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    public int ResponseCount { get; set; }
    public DateTime? LastSyncedAt { get; set; }

    public Job Job { get; set; } = null!;
    public User PostedBy { get; set; } = null!;
}
