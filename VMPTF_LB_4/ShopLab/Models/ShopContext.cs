namespace ShopLab.Models;

using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

// Модель Користувача
[Index(nameof(Email), IsUnique = true)] // Оптимізація: швидкий пошук і унікальність
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Зв'язок 1-до-багатьох
    public List<Order> Orders { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
}

// Модель Категорії
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Зв'язок 1-до-багатьох
    public List<Product> Products { get; set; } = new();
}

// Модель Товару
[Index(nameof(CategoryId))] // Оптимізація: швидка фільтрація товарів за категорією
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    // Зв'язок Багато-до-багатьох (EF Core створить проміжну таблицю автоматично)
    public List<Order> Orders { get; set; } = new();
    // Зв'язок 1-до-багатьох
    public List<Review> Reviews { get; set; } = new();
}

// Модель Замовлення
public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Зв'язок Багато-до-багатьох
    public List<Product> Products { get; set; } = new();
}

// Модель Відгуку
public class Review
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Rating { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}

// Контекст бази даних (налаштування SQLite)
public class ShopContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=shop.db"); // Використовуємо SQLite
    }
}