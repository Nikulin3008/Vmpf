namespace ShopLab.Models;

// Для створення/оновлення Категорії потрібна тільки назва
public class CategoryDto
{
    public string Name { get; set; } = string.Empty;
}

// Для Товару потрібні назва, ціна та ID категорії, до якої він належить
public class ProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
}

// Для Відгуку потрібен текст, оцінка, хто написав (UserId) і на що (ProductId)
public class ReviewDto
{
    public string Text { get; set; } = string.Empty;
    public int Rating { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
}