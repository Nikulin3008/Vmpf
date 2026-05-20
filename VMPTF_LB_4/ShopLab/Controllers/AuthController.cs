namespace ShopLab.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopLab.Models;
using ShopLab.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ShopContext _context;
    private readonly AuthService _authService;

    public AuthController(ShopContext context, AuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    // CREATE: Реєстрація нового користувача
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Користувач вже існує");

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = dto.Password // У реальному проєкті тут має бути хешування
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok("Користувача успішно зареєстровано");
    }

    // ЛОГІН: Отримання JWT Токена
    [HttpPost("login")]
    public async Task<IActionResult> Login(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || user.PasswordHash != password) // У лабі спрощений пароль без хешування
            return Unauthorized("Невірний email або пароль");

        var token = _authService.GenerateJwtToken(user);
        return Ok(new { Token = token });
    }
}