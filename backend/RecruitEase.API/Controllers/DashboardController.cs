using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitEase.API.Helpers;
using RecruitEase.API.Services;

namespace RecruitEase.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleConstants.AdminOrHR)]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _dashboardService.GetSummaryAsync();
        return Ok(result);
    }
}
