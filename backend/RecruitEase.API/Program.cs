using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RecruitEase.API.Data;
using RecruitEase.API.Services;
using RecruitEase.API.Models;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// Database - Use InMemory for testing (comment out SQL Server)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("RecruitEaseTestDb"));
    
// Uncomment for production SQL Server:
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Services DI
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<ICandidateService, CandidateService>();
builder.Services.AddScoped<IInterviewService, InterviewService>();
builder.Services.AddScoped<INaukriService, NaukriService>();

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "RecruitEase API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

// Seed database with test user
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Ensure database is created
    dbContext.Database.EnsureCreated();
    
    // Seed roles if not exists
    if (!dbContext.Roles.Any())
    {
        var roles = new List<Role>
        {
            new Role { Id = 1, Name = "Admin", Description = "System Administrator" },
            new Role { Id = 2, Name = "HR", Description = "Human Resources" },
            new Role { Id = 3, Name = "Interviewer", Description = "Technical Interviewer" }
        };
        dbContext.Roles.AddRange(roles);
        dbContext.SaveChanges();
    }
    
    // Seed admin user if not exists
    if (!dbContext.Users.Any())
    {
        var adminRole = dbContext.Roles.FirstOrDefault(r => r.Name == "Admin");
        if (adminRole != null)
        {
            // Use a known hash for password "Admin@123"
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "System Administrator",
                Email = "admin@recruitease.com",
                PasswordHash = "$2a$11$7Dzf1bMGVOYiBCg7E0KjzO3K7ZS1vUKlsho42wYd7ubzj/4e.9XbG", // Admin@123
                Phone = "+1234567890",
                RoleId = adminRole.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = null
            };
            dbContext.Users.Add(adminUser);
            dbContext.SaveChanges();
        }
    }
}

app.Run();
