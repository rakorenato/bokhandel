namespace BokhandelApi.Models;

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateOnly PublishedDate { get; set; }
    public string? Genre { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Varje bok tillhör en användare.
    public int UserId { get; set; }
    public User? User { get; set; }
}
