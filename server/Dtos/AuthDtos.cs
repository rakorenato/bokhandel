using System.ComponentModel.DataAnnotations;

namespace BokhandelApi.Dtos;

public class RegisterRequest
{
    [Required(ErrorMessage = "Användarnamn krävs.")]
    [StringLength(30, MinimumLength = 3, ErrorMessage = "Användarnamnet måste vara 3–30 tecken.")]
    [RegularExpression(@"^[a-zA-Z0-9_.\-]+$", ErrorMessage = "Användarnamnet får bara innehålla bokstäver (a–z), siffror, punkt, bindestreck och understreck.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Lösenord krävs.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Lösenordet måste vara minst 6 tecken.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required(ErrorMessage = "Användarnamn krävs.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Lösenord krävs.")]
    public string Password { get; set; } = string.Empty;
}

/// <summary>Det som skickas tillbaka till front-end efter lyckad inloggning.</summary>
public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class MessageResponse
{
    public string Message { get; set; } = string.Empty;

    public MessageResponse() { }
    public MessageResponse(string message) => Message = message;
}
