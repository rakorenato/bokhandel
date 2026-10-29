using System.Security.Claims;
using System.Text;
using BokhandelApi.Data;
using BokhandelApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Hostingtjänster som Render anger vilken port appen ska lyssna på via PORT.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// ---------- Databas ----------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=bokhandel.db"));

// ---------- JWT ----------
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key saknas eller är för kort (minst 32 tecken). " +
        "Lokalt finns den i appsettings.Development.json, i produktion sätts den med miljövariabeln Jwt__Key.");
}

builder.Services.AddScoped<TokenService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Behåll claim-namnen som de står i token ("sub", "username").
        options.MapInboundClaims = false;

        // Här bestäms vad som krävs för att en token ska godkännas.
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "username"
        };

        // Extra kontroll: användaren i token måste fortfarande finnas i databasen.
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var sub = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);

                if (!int.TryParse(sub, out var userId) || !await db.Users.AnyAsync(u => u.Id == userId))
                {
                    context.Fail("Användaren finns inte längre.");
                }
            }
        };
    });

builder.Services.AddAuthorization();

// ---------- CORS (tillåt Angular-appen att anropa API:t) ----------
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:4200" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddProblemDetails();

var app = builder.Build();

// Skapa databasen och tabellerna om de inte finns.
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Öppen endpoint för att se att API:t är igång (används även av Render).
app.MapGet("/", () => Results.Ok(new { name = "Bokhandel API", status = "ok" }));
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

app.Run();
