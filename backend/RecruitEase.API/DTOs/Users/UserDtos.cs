using System.ComponentModel.DataAnnotations;
using RecruitEase.API.DTOs.Auth;

namespace RecruitEase.API.DTOs.Users;

public class UpdateUserRequest
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;
    [MaxLength(20)]
    public string? Phone { get; set; }
}

public class UserListResponse
{
    public List<UserProfileResponse> Items { get; set; } = new();
    public int TotalCount { get; set; }
}
