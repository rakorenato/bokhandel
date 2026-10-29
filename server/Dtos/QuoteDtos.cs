using System.ComponentModel.DataAnnotations;
using BokhandelApi.Models;

namespace BokhandelApi.Dtos;

public class QuoteRequest
{
    [Required(ErrorMessage = "Citatet får inte vara tomt.")]
    [StringLength(500, ErrorMessage = "Citatet får vara max 500 tecken.")]
    public string Text { get; set; } = string.Empty;

    [Required(ErrorMessage = "Upphovsperson krävs.")]
    [StringLength(100, ErrorMessage = "Upphovspersonen får vara max 100 tecken.")]
    public string Author { get; set; } = string.Empty;
}

public class QuoteResponse
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public static QuoteResponse From(Quote quote) => new()
    {
        Id = quote.Id,
        Text = quote.Text,
        Author = quote.Author,
        CreatedAt = quote.CreatedAt
    };
}
