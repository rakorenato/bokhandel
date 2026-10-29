using System.ComponentModel.DataAnnotations;
using BokhandelApi.Models;

namespace BokhandelApi.Dtos;

public class BookRequest
{
    [Required(ErrorMessage = "Titel krävs.")]
    [StringLength(200, ErrorMessage = "Titeln får vara max 200 tecken.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Författare krävs.")]
    [StringLength(150, ErrorMessage = "Författaren får vara max 150 tecken.")]
    public string Author { get; set; } = string.Empty;

    [Required(ErrorMessage = "Publiceringsdatum krävs.")]
    public DateOnly? PublishedDate { get; set; }

    [StringLength(50, ErrorMessage = "Genren får vara max 50 tecken.")]
    public string? Genre { get; set; }
}

public class BookResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateOnly PublishedDate { get; set; }
    public string? Genre { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static BookResponse From(Book book) => new()
    {
        Id = book.Id,
        Title = book.Title,
        Author = book.Author,
        PublishedDate = book.PublishedDate,
        Genre = book.Genre,
        CreatedAt = book.CreatedAt,
        UpdatedAt = book.UpdatedAt
    };
}
