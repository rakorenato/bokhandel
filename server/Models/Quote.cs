namespace BokhandelApi.Models;

public class Quote
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Varje citat tillhör en användare.
    public int UserId { get; set; }
    public User? User { get; set; }
}
