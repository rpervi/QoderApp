using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitEase.API.DTOs.Naukri;
using RecruitEase.API.Helpers;
using RecruitEase.API.Services;

namespace RecruitEase.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleConstants.AdminOrHR)]
public class NaukriController : ControllerBase
{
    private readonly INaukriService _naukriService;

    public NaukriController(INaukriService naukriService)
    {
        _naukriService = naukriService;
    }

    [HttpPost("post-job")]
    public async Task<IActionResult> PostJob([FromBody] PostToNaukriRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var result = await _naukriService.PostJobAsync(request.JobId, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("postings")]
    public async Task<IActionResult> GetPostings()
    {
        var result = await _naukriService.GetPostingsAsync();
        return Ok(result);
    }

    [HttpGet("postings/{id}/resumes")]
    public async Task<IActionResult> GetResumes(int id)
    {
        try
        {
            var result = await _naukriService.GetResumesForPostingAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("postings/{id}/sync")]
    public async Task<IActionResult> SyncPosting(int id)
    {
        try
        {
            var result = await _naukriService.SyncPostingAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
