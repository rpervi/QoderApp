using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitEase.API.DTOs.Interviews;
using RecruitEase.API.Helpers;
using RecruitEase.API.Models;
using RecruitEase.API.Services;

namespace RecruitEase.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleConstants.AdminOrHR)]
public class InterviewsController : ControllerBase
{
    private readonly IInterviewService _interviewService;

    public InterviewsController(IInterviewService interviewService)
    {
        _interviewService = interviewService;
    }

    [HttpGet]
    public async Task<IActionResult> GetInterviews(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] InterviewStatus? status = null, [FromQuery] DateTime? date = null)
    {
        var result = await _interviewService.GetInterviewsAsync(page, pageSize, status, date);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetInterview(int id)
    {
        try
        {
            var result = await _interviewService.GetInterviewByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> ScheduleInterview([FromBody] ScheduleInterviewRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _interviewService.ScheduleInterviewAsync(request, userId);
        return CreatedAtAction(nameof(GetInterview), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInterview(int id, [FromBody] UpdateInterviewRequest request)
    {
        try
        {
            var result = await _interviewService.UpdateInterviewAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInterviewStatusRequest request)
    {
        try
        {
            var result = await _interviewService.UpdateStatusAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/feedback")]
    public async Task<IActionResult> SubmitFeedback(int id, [FromBody] SubmitFeedbackRequest request)
    {
        try
        {
            var result = await _interviewService.SubmitFeedbackAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcoming()
    {
        var result = await _interviewService.GetUpcomingInterviewsAsync();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = RoleConstants.Admin)]
    public async Task<IActionResult> DeleteInterview(int id)
    {
        try
        {
            await _interviewService.DeleteInterviewAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
