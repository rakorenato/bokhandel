using BokhandelApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BokhandelApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Quote> Quotes => Set<Quote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(user =>
        {
            // NOCASE gör att "Renato" och "renato" räknas som samma användarnamn.
            user.Property(u => u.Username).HasMaxLength(30).IsRequired().UseCollation("NOCASE");
            user.HasIndex(u => u.Username).IsUnique();
            user.Property(u => u.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Book>(book =>
        {
            book.Property(b => b.Title).HasMaxLength(200).IsRequired();
            book.Property(b => b.Author).HasMaxLength(150).IsRequired();
            book.Property(b => b.Genre).HasMaxLength(50);
            book.HasOne(b => b.User)
                .WithMany(u => u.Books)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Quote>(quote =>
        {
            quote.Property(q => q.Text).HasMaxLength(500).IsRequired();
            quote.Property(q => q.Author).HasMaxLength(100).IsRequired();
            quote.HasOne(q => q.User)
                .WithMany(u => u.Quotes)
                .HasForeignKey(q => q.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
