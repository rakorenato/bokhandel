using BokhandelApi.Models;

namespace BokhandelApi.Data;

/// <summary>
/// De fem startcitat som varje ny användare får på sin "Mina citat"-sida.
/// </summary>
public static class DefaultQuotes
{
    private static readonly (string Text, string Author)[] Quotes =
    [
        ("Det är inte för att saker är svåra som vi inte vågar, det är för att vi inte vågar som de är svåra.", "Seneca"),
        ("Ett rum utan böcker är som en kropp utan själ.", "Cicero"),
        ("Kunskap är makt.", "Francis Bacon"),
        ("Jag tänker, alltså finns jag.", "René Descartes"),
        ("Den enda sanna visdomen är att veta att man ingenting vet.", "Sokrates"),
    ];

    public static List<Quote> CreateFor(User user)
    {
        var now = DateTime.UtcNow;

        // Lite olika tidsstämplar så att ordningen i listan blir stabil.
        return Quotes
            .Select((q, index) => new Quote
            {
                Text = q.Text,
                Author = q.Author,
                User = user,
                CreatedAt = now.AddSeconds(-index)
            })
            .ToList();
    }
}
