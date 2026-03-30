using Microsoft.EntityFrameworkCore;
using RecruitEase.API.Models;

namespace RecruitEase.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<NaukriPosting> NaukriPostings => Set<NaukriPosting>();
    public DbSet<CommunicationLog> CommunicationLogs => Set<CommunicationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Role
        modelBuilder.Entity<Role>(e =>
        {
            e.HasIndex(r => r.Name).IsUnique();
            e.Property(r => r.Name).HasMaxLength(50);
            e.Property(r => r.Description).HasMaxLength(200);
        });

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.FullName).HasMaxLength(100);
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.PasswordHash).HasMaxLength(500);
            e.Property(u => u.Phone).HasMaxLength(20);
            e.Property(u => u.RefreshToken).HasMaxLength(500);
            e.HasOne(u => u.Role).WithMany(r => r.Users).HasForeignKey(u => u.RoleId);
        });

        // Job
        modelBuilder.Entity<Job>(e =>
        {
            e.Property(j => j.Title).HasMaxLength(200);
            e.Property(j => j.Department).HasMaxLength(100);
            e.Property(j => j.Location).HasMaxLength(200);
            e.Property(j => j.Skills).HasMaxLength(500);
            e.Property(j => j.SalaryMin).HasColumnType("decimal(18,2)");
            e.Property(j => j.SalaryMax).HasColumnType("decimal(18,2)");
            e.HasIndex(j => new { j.Status, j.IsActive });
            e.HasOne(j => j.CreatedBy).WithMany(u => u.CreatedJobs).HasForeignKey(j => j.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // Candidate
        modelBuilder.Entity<Candidate>(e =>
        {
            e.Property(c => c.FullName).HasMaxLength(100);
            e.Property(c => c.Email).HasMaxLength(256);
            e.Property(c => c.Phone).HasMaxLength(20);
            e.Property(c => c.CurrentCompany).HasMaxLength(200);
            e.Property(c => c.CurrentRole).HasMaxLength(200);
            e.Property(c => c.ExperienceYears).HasColumnType("decimal(4,1)");
            e.Property(c => c.Skills).HasMaxLength(500);
            e.Property(c => c.LinkedInUrl).HasMaxLength(500);
        });

        // Resume
        modelBuilder.Entity<Resume>(e =>
        {
            e.Property(r => r.FilePath).HasMaxLength(500);
            e.Property(r => r.Source).HasMaxLength(100);
            e.HasIndex(r => new { r.JobId, r.Status });
            e.HasIndex(r => r.CandidateId);
            e.HasOne(r => r.Candidate).WithMany(c => c.Resumes).HasForeignKey(r => r.CandidateId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Job).WithMany(j => j.Resumes).HasForeignKey(r => r.JobId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.ReviewedBy).WithMany().HasForeignKey(r => r.ReviewedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // Interview
        modelBuilder.Entity<Interview>(e =>
        {
            e.Property(i => i.MeetingLink).HasMaxLength(500);
            e.Property(i => i.InterviewerName).HasMaxLength(100);
            e.Property(i => i.InterviewerEmail).HasMaxLength(256);
            e.HasIndex(i => new { i.ScheduledByUserId, i.InterviewDate });
            e.HasIndex(i => i.Status);
            e.HasIndex(i => i.InterviewDate);
            e.HasOne(i => i.Candidate).WithMany(c => c.Interviews).HasForeignKey(i => i.CandidateId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Job).WithMany(j => j.Interviews).HasForeignKey(i => i.JobId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.ScheduledBy).WithMany().HasForeignKey(i => i.ScheduledByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // NaukriPosting
        modelBuilder.Entity<NaukriPosting>(e =>
        {
            e.Property(n => n.NaukriJobCode).HasMaxLength(50);
            e.HasIndex(n => n.JobId);
            e.HasOne(n => n.Job).WithMany(j => j.NaukriPostings).HasForeignKey(n => n.JobId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(n => n.PostedBy).WithMany().HasForeignKey(n => n.PostedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // CommunicationLog
        modelBuilder.Entity<CommunicationLog>(e =>
        {
            e.Property(c => c.Subject).HasMaxLength(200);
            e.Property(c => c.Status).HasMaxLength(50);
            e.HasIndex(c => c.CandidateId);
            e.HasOne(c => c.Candidate).WithMany(ca => ca.CommunicationLogs).HasForeignKey(c => c.CandidateId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.Job).WithMany().HasForeignKey(c => c.JobId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.SentBy).WithMany().HasForeignKey(c => c.SentByUserId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
