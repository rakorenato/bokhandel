using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace BokhandelApi.Controllers;

/// <summary>
/// Basklass för alla skyddade controllers.
/// [Authorize] gör att varje anrop måste ha en giltig JWT i headern
/// "Authorization: Bearer &lt;token&gt;", annars svarar servern 401.
/// </summary>
[ApiController]
[Authorize]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>Id för den inloggade användaren, hämtat från token ("sub").</summary>
    protected int CurrentUserId =>
        int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? throw new UnauthorizedAccessException("Token saknar användar-id."));
}
