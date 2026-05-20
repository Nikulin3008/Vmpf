using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ShopLab.Models; // Твій namespace моделей
using ShopLab.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Реєструємо базу даних SQLite
builder.Services.AddDbContext<ShopContext>();

// 2. Реєструємо наші сервіси, щоб контролери могли їх використовувати
builder.Services.AddScoped<ShopService>();
builder.Services.AddScoped<AuthService>();

// 3. Налаштовуємо JWT Аутентифікацію
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.ASCII.GetBytes("Your_Super_Secret_Key_For_JWT_Minimum_16_Chars!"))
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Додаємо кнопку Authorize у Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Введіть JWT токен сюди (слово Bearer писати не потрібно)",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 4. Обов'язково додаємо ці два рядки для роботи JWT!
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();