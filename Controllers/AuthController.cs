using Microsoft.AspNetCore.Mvc;
using api.Models;
using api.Services;
using api.Data; 
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;

        public AuthController(IConfiguration config, AppDbContext context)
        {
            _config = config;
            _context = context;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email_Work == loginRequest.Email_Work);
            
            if (user == null || user.Password != loginRequest.Password) 
                return Unauthorized("Invalid credentials");

            var accessToken = JwtTokenServices.GenerateAccessToken(user.Email_Work, _config);
            var refreshToken = JwtTokenServices.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.Now.AddDays(7);
            await _context.SaveChangesAsync();

            SetRefreshTokenCookie(refreshToken);

            return Ok(new { token = accessToken, username = user.EmpName, id = user.ID });
        }

        [AllowAnonymous] 
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            
            if (!string.IsNullOrEmpty(refreshToken))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
                if (user != null)
                {
                    user.RefreshToken = null;
                    user.RefreshTokenExpiry = null;
                    await _context.SaveChangesAsync();
                }
            }

            var cookieOptions = new CookieOptions 
            { 
                HttpOnly = true, 
                Secure = true, 
                SameSite = SameSiteMode.None, 
                Path = "/" 
            };
            
            Response.Cookies.Delete("refreshToken", cookieOptions);

            return Ok(new { message = "Logged out successfully" });
        }

        [AllowAnonymous]
        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var employees = await _context.Users
                .Select(u => new 
                { 
                    id = u.ID, 
                    empName = u.EmpName 
                })
                .ToListAsync();

            return Ok(employees);
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken)) return Unauthorized("No refresh token");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.Now)
                return Unauthorized("Invalid or expired refresh token");

            var newAccessToken = JwtTokenServices.GenerateAccessToken(user.Email_Work, _config);
            var newRefreshToken = JwtTokenServices.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            await _context.SaveChangesAsync();

            SetRefreshTokenCookie(newRefreshToken);

            return Ok(new { token = newAccessToken, id = user.ID });
        }

        private void SetRefreshTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.Now.AddDays(7),
                Path = "/"
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }
    }
}