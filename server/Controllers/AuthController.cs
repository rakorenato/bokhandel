using BokhandelApi.Data;
using BokhandelApi.Dtos;
using BokhandelApi.Models;
using BokhandelApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BokhandelApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokenService) : ControllerBase
{
    // POST api/auth/register
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var username = request.Username.Trim();

        if (await db.Users.AnyAsync(u => u.Username == username))
        {
            return Conflict(new MessageResponse("Användarnamnet är redan taget."));
        }

        var user = new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        db.Users.Add(user);
        // Nya användare får fem citat från start på "Mina citat".
        db.Quotes.AddRange(DefaultQuotes.CreateFor(user));
        await db.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created,
            new MessageResponse($"Kontot {user.Username} skapades. Logga in för att fortsätta."));
    }

    // POST api/auth/login
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var username = request.Username.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);

        // Samma felmeddelande oavsett om användaren saknas eller lösenordet är fel,
        // så att man inte kan ta reda på vilka användarnamn som finns.
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new MessageResponse("Fel användarnamn eller lösenord."));
        }

        var token = tokenService.CreateToken(user);

        return Ok(new AuthResponse
        {
            Token = token.Token,
            Username = user.Username,
            ExpiresAt = token.ExpiresAt
        });
    }

    // GET api/auth/me  (kräver token) – används för att kontrollera att token fortfarande är giltig
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            Id = User.FindFirst("sub")?.Value,
            Username = User.FindFirst("username")?.Value
        });
    }
}
