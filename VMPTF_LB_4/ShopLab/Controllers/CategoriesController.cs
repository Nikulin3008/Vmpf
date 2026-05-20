namespace ShopLab.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopLab.Models;

[Authorize] // Рівень 4: Доступ тільки для авторизованих користувачів
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ShopContext _context;
    public CategoriesController(ShopContext context) { _context = context; }

    [HttpGet] // READ ALL
    public async Task<IActionResult> GetAll() => Ok(await _context.Categories.ToListAsync());

    [HttpPost] // CREATE
    public async Task<IActionResult> Create([FromBody] CategoryDto dto)
    {
        var category = new Category { Name = dto.Name };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return Ok(category);
    }

    [HttpPut("{id}")] // UPDATE
    public async Task<IActionResult> Update(int id, [FromBody] CategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();

        category.Name = dto.Name;
        await _context.SaveChangesAsync();
        return Ok("Категорію оновлено");
    }

    [HttpDelete("{id}")] // DELETE
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Ok("Видалено");
    }
}