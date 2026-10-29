# 📚 Bokhandel

En responsiv CRUD-webbapplikation där inloggade användare kan hantera sina böcker och favoritcitat.

- **Frontend:** Angular 20, Bootstrap 5.3, Font Awesome 6
- **Backend:** .NET 9 Web API (C#), Entity Framework Core med SQLite
- **Inloggning:** JWT (JSON Web Tokens), lösenord hashade med BCrypt

**Publicerad sida:** https://bokhandel-renato.netlify.app
**API:** https://bokhandel.onrender.com

---

## Funktioner

| Krav | Var det finns |
|---|---|
| Lista med alla böcker på startsidan | `client/src/app/pages/books/book-list` |
| Knapp "Lägg till ny bok" → formulär → tillbaka till listan | `book-list` + `book-form` (route `/books/new`) |
| "Redigera" på varje bok → formulär → tillbaka till listan | `book-form` (route `/books/:id/edit`) |
| "Radera" på varje bok, boken försvinner direkt | `book-list` (med bekräftelseruta) |
| Registrera ny användare och logga in | `pages/auth/register`, `pages/auth/login`, `AuthController` |
| Backend skapar JWT vid inloggning | `server/Services/TokenService.cs` |
| Front-end sparar token och skickar den i varje anrop | `core/services/auth.service.ts`, `core/interceptors/auth.interceptor.ts` |
| Token valideras i backend, CRUD kräver inloggning | `Program.cs` (AddJwtBearer) + `[Authorize]` i `ApiControllerBase.cs` |
| "Mina citat" med 5 citat, lägg till / redigera / ta bort | `pages/quotes/quote-list`, `QuotesController`, `Data/DefaultQuotes.cs` |
| Meny mellan bok- och citatvyn | `layout/navbar` |
| Responsiv design och mobilmeny | Bootstrap-grid, `navbar-expand-lg` med hamburgarmeny |
| Bootstrap och Font Awesome | Används i alla vyer |
| Ljust/mörkt tema (extra utmaning) | `core/services/theme.service.ts` + knappen i menyn |

**Extra:** sök och sortering av böcker, validering med felmeddelanden på svenska, bekräftelse innan något raderas, notiser ("toasts"), automatisk utloggning när token går ut, sida för 404.

---

## Projektstruktur

```
Bokhandel/
├── client/                     Angular 20
│   └── src/app/
│       ├── core/               Tjänster, modeller, guard och interceptor
│       ├── layout/navbar/      Menyn
│       ├── shared/             Bekräftelseruta och notiser
│       └── pages/              Sidorna (auth, books, quotes, not-found)
├── server/                     .NET 9 Web API
│   ├── Controllers/            Auth, Books, Quotes
│   ├── Data/                   DbContext och startcitat
│   ├── Dtos/                   Det som skickas in och ut ur API:t
│   ├── Models/                 User, Book, Quote
│   ├── Services/TokenService.cs
│   └── Program.cs              Startpunkt: JWT, CORS, databas
└── README.md
```

---

## Köra projektet lokalt

### Det här behövs
- [Node.js](https://nodejs.org) 20.19 eller senare (22 LTS rekommenderas)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

### 1. Starta API:t
```bash
cd server
dotnet run
```
API:t startar på **http://localhost:5000**. Databasen (`bokhandel.db`) skapas automatiskt första gången.

### 2. Starta Angular-appen (i en ny terminal)
```bash
cd client
npm install
npm start
```
Öppna **http://localhost:4200**, skapa ett konto och logga in.

> Tips: I `server/BokhandelApi.http` finns färdiga anrop för att testa API:t direkt i VS Code (tillägget *REST Client*).

---

## Så fungerar inloggningen (JWT)

1. Användaren registrerar sig. Lösenordet hashas med BCrypt och sparas, aldrig i klartext.
2. Vid inloggning kontrollerar servern lösenordet och skapar en **JWT** som signeras med en hemlig nyckel. Token innehåller användarens id och gäller i 4 timmar.
3. Angular sparar token i `localStorage`.
4. En **interceptor** lägger automatiskt till `Authorization: Bearer <token>` på alla anrop till API:t.
5. Servern **validerar token** (signatur, utgivare, mottagare, giltighetstid och att användaren finns) innan den släpper in anropet. Utan giltig token svarar den `401 Unauthorized`.
6. Får Angular ett `401`, eller går token ut, loggas användaren ut och skickas till inloggningen.
7. **Route guards** gör att man inte kan öppna bok- eller citatsidorna utan att vara inloggad.

**Om lagringen:** `localStorage` är enkelt och gör att man förblir inloggad efter omladdning. Nackdelen är att JavaScript på sidan kan läsa token, så den är sårbar om sidan skulle ha en XSS-brist. Ett säkrare alternativ är en `HttpOnly`-cookie, men det kräver mer konfiguration (CSRF-skydd, cookies mellan olika domäner).

### API-endpoints

| Metod | Adress | Skyddad |
|---|---|---|
| POST | `/api/auth/register` | Nej |
| POST | `/api/auth/login` | Nej |
| GET | `/api/auth/me` | Ja |
| GET / POST | `/api/books` | Ja |
| GET / PUT / DELETE | `/api/books/{id}` | Ja |
| GET / POST | `/api/quotes` | Ja |
| GET / PUT / DELETE | `/api/quotes/{id}` | Ja |
| GET | `/api/health` | Nej |

---

## Publicera (gratis)

Frontend och backend hostas på olika ställen: **Render** för API:t och **Netlify** för Angular-appen.

### Steg 1 – Lägg upp koden på GitHub
```bash
git init
git add .
git commit -m "Bokhandel: Angular 20 + .NET 9 med JWT"
git branch -M main
git remote add origin https://github.com/<ditt-användarnamn>/bokhandel.git
git push -u origin main
```

### Steg 2 – API:t på Render
1. Logga in på [render.com](https://render.com) med GitHub.
2. **New → Web Service** och välj repot.
3. Inställningar:
   - **Root Directory:** `server`
   - **Runtime / Language:** Docker
   - **Instance Type:** Free
4. Under **Environment Variables**, lägg till:
   - `Jwt__Key` = en lång slumpmässig text (minst 32 tecken)
   - `Cors__AllowedOrigins__0` = din Netlify-adress (fylls i efter steg 3, t.ex. `https://bokhandel-renato.netlify.app`)
5. Skapa tjänsten. När den är klar får du en adress som `https://bokhandel-api.onrender.com`. Testa `…/api/health` i webbläsaren.

### Steg 3 – Frontend på Netlify
1. Öppna `client/src/environments/environment.ts` och byt `apiUrl` till din Render-adress + `/api`, t.ex. `https://bokhandel-api.onrender.com/api`. Committa och pusha.
2. Logga in på [netlify.com](https://netlify.com) → **Add new site → Import an existing project** → välj repot.
3. Sätt **Base directory** till `client`. Övriga inställningar läses från `client/netlify.toml`.
4. Deploya och kopiera adressen.
5. Gå tillbaka till Render och sätt `Cors__AllowedOrigins__0` till Netlify-adressen (utan `/` på slutet). Render startar om API:t automatiskt.

### Bra att veta om gratisplanerna
- Render-tjänsten **somnar efter 15 minuter** utan trafik. Första anropet efter det kan ta upp till en minut. Inloggningssidan visar ett meddelande om det tar tid.
- Render Free har **ingen permanent disk**, så SQLite-databasen töms när tjänsten startas om eller deployas. För en skoluppgift går det bra, men för riktig drift behövs en extern databas (t.ex. PostgreSQL).

---

## Testa responsiviteten

- Ändra storlek på webbläsarfönstret eller använd DevTools (F12 → enhetsläge) med t.ex. iPhone SE (375 px), iPad (820 px) och desktop (1280 px+).
- Under 992 px fälls menyn ihop till en hamburgarmeny som stängs automatiskt när man byter sida.
- Boklistan går från 3 kolumner (stor skärm) till 2 (surfplatta) och 1 (mobil).
- På "Mina citat" ligger formuläret bredvid listan på stora skärmar och ovanför listan på mobil.
- Testat i Chromium på mobil-, surfplatte- och desktopbredd i både ljust och mörkt tema, utan horisontell scroll.
