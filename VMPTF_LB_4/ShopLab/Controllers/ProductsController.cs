namespace ShopLab.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopLab.Models;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ShopContext _context;
    public ProductsController(ShopContext context) { _context = context; }

    [HttpGet] // READ ALL + Оптимізація Рівень 3 (Попереднє завантаження)
    public async Task<IActionResult> GetAll()
    {
        var products = await _context.Products
            .Include(p => p.Category) // Завантажуємо пов'язану категорію одним запитом
            .ToListAsync();
        return Ok(products);
    }

    [HttpPost] // CREATE
    public async Task<IActionResult> Create([FromBody] ProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            CategoryId = dto.CategoryId
        };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return Ok(product);
    }

    [HttpPut("{id}")] // UPDATE
    public async Task<IActionResult> Update(int id, [FromBody] ProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = dto.Name;
        product.Price = dto.Price;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();
        return Ok("Товар оновлено");
    }

    [HttpDelete("{id}")] // DELETE
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Ok("Товар видалено");
    }
}