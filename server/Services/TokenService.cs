using System.Security.Claims;
using System.Text;
using BokhandelApi.Models;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace BokhandelApi.Services;

/// <summary>
/// Skapar JWT-token när en användare loggar in.
/// Token signeras med en hemlig nyckel (Jwt:Key) som bara servern känner till.
/// </summary>
public class TokenService(IConfiguration config)
{
    public AuthTokenResult CreateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var expiresAt = DateTime.UtcNow.AddHours(config.GetValue("Jwt:ExpiresInHours", 4));

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                // "sub" = användarens id, används för att veta vems böcker/citat det gäller
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            }),
            Issuer = config["Jwt:Issuer"],
            Audience = config["Jwt:Audience"],
            Expires = expiresAt,
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        };

        var token = new JsonWebTokenHandler().CreateToken(descriptor);
        return new AuthTokenResult(token, expiresAt);
    }
}

public record AuthTokenResult(string Token, DateTime ExpiresAt);
