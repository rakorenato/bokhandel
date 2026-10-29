# Bygg-steg
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY BokhandelApi.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# Körning
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Mapp för SQLite-databasen som appens användare får skriva i
RUN mkdir -p /app/data && chown $APP_UID /app/data
ENV ConnectionStrings__Default="Data Source=/app/data/bokhandel.db"
ENV ASPNETCORE_ENVIRONMENT=Production

USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "BokhandelApi.dll"]
