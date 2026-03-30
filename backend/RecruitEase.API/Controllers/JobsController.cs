using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitEase.API.DTOs.Jobs;
using RecruitEase.API.Helpers;
using RecruitEase.API.Models;
using RecruitEase.API.Services;

namespace RecruitEase.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleConstants.AdminOrHR)]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobService;
    private readonly ICandidateService _candidateService;

    public JobsController(IJobService jobService, ICandidateService candidateService)
    {
        _jobService = jobService;
        _candidateService = candidateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] JobStatus? status = null,
        [FromQuery] string? sortBy = null, [FromQuery] string? sortDir = null)
    {
        var result = await _jobService.GetJobsAsync(page, pageSize, search, status, sortBy, sortDir);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetJob(int id)
    {
        try
        {
            var result = await _jobService.GetJobByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _jobService.CreateJobAsync(request, userId);
        return CreatedAtAction(nameof(GetJob), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateJob(int id, [FromBody] UpdateJobRequest request)
    {
        try
        {
            var result = await _jobService.UpdateJobAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = RoleConstants.Admin)]
    public async Task<IActionResult> DeleteJob(int id)
    {
        try
        {
            await _jobService.DeleteJobAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeJobStatusRequest request)
    {
        try
        {
            var result = await _jobService.ChangeStatusAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/candidates")]
    public async Task<IActionResult> GetCandidates(int id)
    {
        var result = await _candidateService.GetCandidatesForJobAsync(id);
        return Ok(result);
    }
}
