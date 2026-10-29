using BokhandelApi.Data;
using BokhandelApi.Dtos;
using BokhandelApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BokhandelApi.Controllers;

/// <summary>
/// CRUD för böcker. Ärver [Authorize] från ApiControllerBase,
/// så bara inloggade användare kommer åt endpoints här.
/// Varje användare ser och ändrar bara sina egna böcker.
/// </summary>
[Route("api/books")]
public class BooksController(AppDbContext db) : ApiControllerBase
{
    // GET api/books
    [HttpGet]
    public async Task<ActionResult<List<BookResponse>>> GetAll()
    {
        var userId = CurrentUserId;

        var books = await db.Books
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return books.Select(BookResponse.From).ToList();
    }

    // GET api/books/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookResponse>> GetById(int id)
    {
        var book = await FindOwnBook(id);
        if (book is null) return NotFound(new MessageResponse("Boken hittades inte."));

        return BookResponse.From(book);
    }

    // POST api/books
    [HttpPost]
    public async Task<ActionResult<BookResponse>> Create(BookRequest request)
    {
        if (IsInFuture(request.PublishedDate)) return FutureDateProblem();

        var book = new Book
        {
            Title = request.Title.Trim(),
            Author = request.Author.Trim(),
            PublishedDate = request.PublishedDate!.Value,
            Genre = string.IsNullOrWhiteSpace(request.Genre) ? null : request.Genre.Trim(),
            UserId = CurrentUserId
        };

        db.Books.Add(book);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = book.Id }, BookResponse.From(book));
    }

    // PUT api/books/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<BookResponse>> Update(int id, BookRequest request)
    {
        if (IsInFuture(request.PublishedDate)) return FutureDateProblem();

        var book = await FindOwnBook(id);
        if (book is null) return NotFound(new MessageResponse("Boken hittades inte."));

        book.Title = request.Title.Trim();
        book.Author = request.Author.Trim();
        book.PublishedDate = request.PublishedDate!.Value;
        book.Genre = string.IsNullOrWhiteSpace(request.Genre) ? null : request.Genre.Trim();
        book.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return BookResponse.From(book);
    }

    // DELETE api/books/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var book = await FindOwnBook(id);
        if (book is null) return NotFound(new MessageResponse("Boken hittades inte."));

        db.Books.Remove(book);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private Task<Book?> FindOwnBook(int id)
    {
        var userId = CurrentUserId;
        return db.Books.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
    }

    private static bool IsInFuture(DateOnly? date) =>
        date.HasValue && date.Value > DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

    private ActionResult FutureDateProblem()
    {
        ModelState.AddModelError(nameof(BookRequest.PublishedDate), "Publiceringsdatum kan inte ligga i framtiden.");
        return ValidationProblem(ModelState);
    }
}
