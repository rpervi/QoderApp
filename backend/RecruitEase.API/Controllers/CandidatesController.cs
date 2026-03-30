using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitEase.API.DTOs.Candidates;
using RecruitEase.API.Helpers;
using RecruitEase.API.Models;
using RecruitEase.API.Services;

namespace RecruitEase.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleConstants.AdminOrHR)]
public class CandidatesController : ControllerBase
{
    private readonly ICandidateService _candidateService;

    public CandidatesController(ICandidateService candidateService)
    {
        _candidateService = candidateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCandidates(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] ResumeStatus? status = null)
    {
        var result = await _candidateService.GetCandidatesAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCandidate(int id)
    {
        try
        {
            var result = await _candidateService.GetCandidateByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateCandidate([FromBody] CreateCandidateRequest request)
    {
        var result = await _candidateService.CreateCandidateAsync(request);
        return CreatedAtAction(nameof(GetCandidate), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCandidate(int id, [FromBody] UpdateCandidateRequest request)
    {
        try
        {
            var result = await _candidateService.UpdateCandidateAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{candidateId}/resumes/{resumeId}/status")]
    public async Task<IActionResult> UpdateResumeStatus(int candidateId, int resumeId, [FromBody] UpdateResumeStatusRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var result = await _candidateService.UpdateResumeStatusAsync(candidateId, resumeId, request, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{candidateId}/communicate")]
    public async Task<IActionResult> SendCommunication(int candidateId, [FromBody] SendCommunicationRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var result = await _candidateService.SendCommunicationAsync(candidateId, request, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{candidateId}/communications")]
    public async Task<IActionResult> GetCommunications(int candidateId)
    {
        var result = await _candidateService.GetCommunicationsAsync(candidateId);
        return Ok(result);
    }
}
