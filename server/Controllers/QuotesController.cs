using BokhandelApi.Data;
using BokhandelApi.Dtos;
using BokhandelApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BokhandelApi.Controllers;

/// <summary>
/// CRUD för "Mina citat". Skyddad med JWT via ApiControllerBase.
/// </summary>
[Route("api/quotes")]
public class QuotesController(AppDbContext db) : ApiControllerBase
{
    // GET api/quotes
    [HttpGet]
    public async Task<ActionResult<List<QuoteResponse>>> GetAll()
    {
        var userId = CurrentUserId;

        var quotes = await db.Quotes
            .Where(q => q.UserId == userId)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

        return quotes.Select(QuoteResponse.From).ToList();
    }

    // GET api/quotes/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuoteResponse>> GetById(int id)
    {
        var quote = await FindOwnQuote(id);
        if (quote is null) return NotFound(new MessageResponse("Citatet hittades inte."));

        return QuoteResponse.From(quote);
    }

    // POST api/quotes
    [HttpPost]
    public async Task<ActionResult<QuoteResponse>> Create(QuoteRequest request)
    {
        var quote = new Quote
        {
            Text = request.Text.Trim(),
            Author = request.Author.Trim(),
            UserId = CurrentUserId
        };

        db.Quotes.Add(quote);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = quote.Id }, QuoteResponse.From(quote));
    }

    // PUT api/quotes/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<QuoteResponse>> Update(int id, QuoteRequest request)
    {
        var quote = await FindOwnQuote(id);
        if (quote is null) return NotFound(new MessageResponse("Citatet hittades inte."));

        quote.Text = request.Text.Trim();
        quote.Author = request.Author.Trim();
        await db.SaveChangesAsync();

        return QuoteResponse.From(quote);
    }

    // DELETE api/quotes/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var quote = await FindOwnQuote(id);
        if (quote is null) return NotFound(new MessageResponse("Citatet hittades inte."));

        db.Quotes.Remove(quote);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private Task<Quote?> FindOwnQuote(int id)
    {
        var userId = CurrentUserId;
        return db.Quotes.FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);
    }
}
