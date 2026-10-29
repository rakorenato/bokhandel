namespace BokhandelApi.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;

    // Lösenordet sparas aldrig i klartext, bara som en BCrypt-hash.
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Book> Books { get; set; } = new();
    public List<Quote> Quotes { get; set; } = new();
}
