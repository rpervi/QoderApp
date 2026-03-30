using Microsoft.EntityFrameworkCore;
using RecruitEase.API.Data;
using RecruitEase.API.DTOs.Naukri;
using RecruitEase.API.Models;

namespace RecruitEase.API.Services;

public interface INaukriService
{
    Task<NaukriPostingDto> PostJobAsync(int jobId, Guid userId);
    Task<List<NaukriPostingDto>> GetPostingsAsync();
    Task<List<NaukriResumeDto>> GetResumesForPostingAsync(int postingId);
    Task<NaukriPostingDto> SyncPostingAsync(int postingId);
}

public class NaukriService : INaukriService
{
    private readonly AppDbContext _context;
    private static readonly Random _random = new();

    private static readonly string[] _mockNames = { "Aarav Sharma", "Diya Patel", "Vihaan Gupta", "Ananya Singh", "Arjun Reddy", "Ishita Mehta", "Reyansh Nair", "Saanvi Joshi", "Aditya Verma", "Myra Iyer" };
    private static readonly string[] _mockCompanies = { "TCS", "Infosys", "Wipro", "HCL", "Tech Mahindra", "Cognizant", "Accenture", "Capgemini", "Mindtree", "Mphasis" };
    private static readonly string[] _mockRoles = { "Software Engineer", "Senior Developer", "Lead Developer", "Full Stack Developer", "Backend Developer", "Frontend Developer", "DevOps Engineer", "QA Engineer" };

    public NaukriService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<NaukriPostingDto> PostJobAsync(int jobId, Guid userId)
    {
        var job = await _context.Jobs.FindAsync(jobId)
            ?? throw new KeyNotFoundException("Job not found.");

        // Simulate posting delay
        await Task.Delay(1500);

        var posting = new NaukriPosting
        {
            JobId = jobId,
            PostedByUserId = userId,
            NaukriJobCode = $"NK-2026-{_random.Next(10000, 99999)}",
            Status = NaukriPostingStatus.Posted,
            ResponseCount = 0
        };

        _context.NaukriPostings.Add(posting);
        await _context.SaveChangesAsync();

        await _context.Entry(posting).Reference(p => p.Job).LoadAsync();
        await _context.Entry(posting).Reference(p => p.PostedBy).LoadAsync();

        return MapToDto(posting);
    }

    public async Task<List<NaukriPostingDto>> GetPostingsAsync()
    {
        return await _context.NaukriPostings
            .Include(p => p.Job)
            .Include(p => p.PostedBy)
            .OrderByDescending(p => p.PostedAt)
            .Select(p => new NaukriPostingDto
            {
                Id = p.Id,
                JobId = p.JobId,
                JobTitle = p.Job.Title,
                NaukriJobCode = p.NaukriJobCode,
                Status = p.Status.ToString(),
                PostedAt = p.PostedAt,
                ResponseCount = p.ResponseCount,
                LastSyncedAt = p.LastSyncedAt,
                PostedByName = p.PostedBy.FullName
            })
            .ToListAsync();
    }

    public async Task<List<NaukriResumeDto>> GetResumesForPostingAsync(int postingId)
    {
        var posting = await _context.NaukriPostings.Include(p => p.Job).FirstOrDefaultAsync(p => p.Id == postingId)
            ?? throw new KeyNotFoundException("Naukri posting not found.");

        // Simulate fetch delay
        await Task.Delay(1000);

        // Generate mock resumes
        var count = _random.Next(2, 6);
        var skills = posting.Job.Skills ?? "JavaScript,Python";
        var resumes = new List<NaukriResumeDto>();

        for (int i = 0; i < count; i++)
        {
            resumes.Add(new NaukriResumeDto
            {
                CandidateName = _mockNames[_random.Next(_mockNames.Length)],
                Email = $"candidate{_random.Next(100, 999)}@email.com",
                Phone = $"98{_random.Next(10000000, 99999999)}",
                CurrentCompany = _mockCompanies[_random.Next(_mockCompanies.Length)],
                CurrentRole = _mockRoles[_random.Next(_mockRoles.Length)],
                ExperienceYears = _random.Next(1, 15),
                Skills = skills,
                NaukriProfileUrl = $"https://www.naukri.com/profile/{_random.Next(100000, 999999)}"
            });
        }

        return resumes;
    }

    public async Task<NaukriPostingDto> SyncPostingAsync(int postingId)
    {
        var posting = await _context.NaukriPostings
            .Include(p => p.Job)
            .Include(p => p.PostedBy)
            .FirstOrDefaultAsync(p => p.Id == postingId)
            ?? throw new KeyNotFoundException("Naukri posting not found.");

        // Simulate sync delay
        await Task.Delay(1000);

        posting.ResponseCount += _random.Next(1, 8);
        posting.LastSyncedAt = DateTime.UtcNow;
        posting.Status = NaukriPostingStatus.Active;

        await _context.SaveChangesAsync();
        return MapToDto(posting);
    }

    private static NaukriPostingDto MapToDto(NaukriPosting p) => new()
    {
        Id = p.Id,
        JobId = p.JobId,
        JobTitle = p.Job.Title,
        NaukriJobCode = p.NaukriJobCode,
        Status = p.Status.ToString(),
        PostedAt = p.PostedAt,
        ResponseCount = p.ResponseCount,
        LastSyncedAt = p.LastSyncedAt,
        PostedByName = p.PostedBy.FullName
    };
}
