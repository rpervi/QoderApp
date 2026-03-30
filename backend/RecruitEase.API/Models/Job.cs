namespace RecruitEase.API.Models;

public class Job
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Department { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public JobType JobType { get; set; } = JobType.FullTime;
    public int? ExperienceMin { get; set; }
    public int? ExperienceMax { get; set; }
    public string? Skills { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Draft;
    public DateTime? PostedDate { get; set; }
    public DateTime? ClosingDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedBy { get; set; } = null!;
    public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
    public ICollection<NaukriPosting> NaukriPostings { get; set; } = new List<NaukriPosting>();
}
