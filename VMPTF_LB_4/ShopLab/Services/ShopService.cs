namespace ShopLab.Services;

using Microsoft.EntityFrameworkCore;
using ShopLab.Models;

public class ShopService
{
    private readonly ShopContext _context;
    public ShopService(ShopContext context) { _context = context; }

    // CREATE: Додавання об'єкта
    public async Task CreateProductAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
    }

    // READ (з попереднім завантаженням / Eager Loading)
    // Завантажуємо замовлення разом із даними про юзера та всіма товарами в ньому
    public async Task<List<Order>> GetUserOrdersAsync(int userId)
    {
        return await _context.Orders
            .Include(o => o.User)         // Підтягуємо юзера
            .Include(o => o.Products)     // Підтягуємо пов'язані товари
            .Where(o => o.UserId == userId)
            .ToListAsync();
    }

    // UPDATE: Оновлення
    public async Task UpdateProductPriceAsync(int productId, decimal newPrice)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product != null)
        {
            product.Price = newPrice;
            await _context.SaveChangesAsync();
        }
    }

    // DELETE: Видалення
    public async Task DeleteCategoryAsync(int categoryId)
    {
        var category = await _context.Categories.FindAsync(categoryId);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}