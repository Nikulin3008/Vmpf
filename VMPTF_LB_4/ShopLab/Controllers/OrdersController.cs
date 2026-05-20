namespace ShopLab.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopLab.Models;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ShopContext _context;
    public OrdersController(ShopContext context) { _context = context; }

    [HttpGet] // READ ALL + Рівень 3: Попереднє завантаження зв'язку Багато-до-Багатьох
    public async Task<IActionResult> GetAll()
    {
        var orders = await _context.Orders
            .Include(o => o.User)       // Попередньо завантажуємо користувача
            .Include(o => o.Products)   // Попередньо завантажуємо список товарів (Many-to-Many)
            .ToListAsync();
        return Ok(orders);
    }

    [HttpPost] // CREATE
    public async Task<IActionResult> Create(int userId, [FromBody] List<int> productIds)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return BadRequest("Користувача не знайдено");

        var order = new Order { UserId = userId, OrderDate = DateTime.UtcNow };

        // Знаходимо всі товари за їх ID та додаємо до замовлення
        var products = await _context.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();
        order.Products.AddRange(products);

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return Ok("Замовлення створено");
    }

    [HttpDelete("{id}")] // DELETE
    public async Task<IActionResult> Delete(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return Ok("Замовлення видалено");
    }
}