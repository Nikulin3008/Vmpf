namespace ShopLab.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopLab.Models;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ShopContext _context;
    public ReviewsController(ShopContext context) { _context = context; }

    [HttpGet] // READ ALL
    public async Task<IActionResult> GetAll()
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Product)
            .ToListAsync();
        return Ok(reviews);
    }

    [HttpPost] // CREATE
    public async Task<IActionResult> Create([FromBody] ReviewDto dto)
    {
        var review = new Review
        {
            Text = dto.Text,
            Rating = dto.Rating,
            UserId = dto.UserId,
            ProductId = dto.ProductId
        };
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return Ok("Відгук додано");
    }

    [HttpPut("{id}")] // UPDATE
    public async Task<IActionResult> Update(int id, [FromBody] ReviewDto dto)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound();

        review.Text = dto.Text;
        review.Rating = dto.Rating;

        await _context.SaveChangesAsync();
        return Ok("Відгук оновлено");
    }

    [HttpDelete("{id}")] // DELETE
    public async Task<IActionResult> Delete(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound();
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return Ok("Відгук видалено");
    }
}