import React, { useState, useEffect } from 'react';

function App() {
  // Стан для перемикання вкладок (за замовчуванням відкрита 1-ша)
  const [activeTab, setActiveTab] = useState(1);

  // Спільний стан для 3 та 4 завдання (Трекер + Візуалізація)
  // Додав кілька відомих тайтлів для старту, щоб одразу було що візуалізувати
  const [mediaItems, setMediaItems] = useState([
  ]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Практична робота №2</h1>

      {/* Навігація (Кнопки для перемикання) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab(1)} style={tabStyle(activeTab === 1)}>1. Погода API</button>
        <button onClick={() => setActiveTab(2)} style={tabStyle(activeTab === 2)}>2. Генератор JSON</button>
        <button onClick={() => setActiveTab(3)} style={tabStyle(activeTab === 3)}>3. Трекер</button>
        <button onClick={() => setActiveTab(4)} style={tabStyle(activeTab === 4)}>4. Візуалізація</button>
      </div>

      {/* Контент вкладок */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', minHeight: '300px' }}>
        {activeTab === 1 && <WeatherTab />}
        {activeTab === 2 && <JsonGeneratorTab />}
        {activeTab === 3 && <TrackerTab mediaItems={mediaItems} setMediaItems={setMediaItems} />}
        {activeTab === 4 && <VisualizationsTab mediaItems={mediaItems} />}
      </div>
    </div>
  );
}

// ==========================================
// Вкладка 1: Прогноз погоди (API fetch)
// ==========================================
function WeatherTab() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  useEffect(() => {
    
    const city = 'Охтирка'; 
    const apiKey = '4ad75cb1791a8eb59b1c97ed77c3e31e'; //  ключ
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ua`;

    // 2. Робимо запит
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error('Помилка з\'єднання або невірний ключ');
        return res.json();
      })
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Прогноз погоди</h2>
      
      {/* Показуємо помилку, якщо ключ ще не активувався або немає інтернету */}
      {error && <p style={{ color: 'red' }}>Помилка: {error}</p>}
      
      {/* Показуємо текст завантаження */}
      {loading && !error && <p>Завантаження даних...</p>}
      
      {/* Виводимо дані, коли вони завантажились */}
      {weather && !loading && (
        <div style={{ fontSize: '18px', background: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
          <p><strong>Місто:</strong> {weather.name}</p>
          <p><strong>Температура:</strong> {weather.main.temp} °C</p>
          <p><strong>Опис:</strong> {weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Вкладка 2: Генератор JSON
// ==========================================
function JsonGeneratorTab() {
  const [inputData, setInputData] = useState('Тут може бути якась інформація...');

  const generateAndDownload = () => {
    // Створюємо об'єкт 
    const myData = {
      author: "Krasava",
      content: inputData,
    };

    // Перетворюємо у JSON
    const jsonString = JSON.stringify(myData, null, 2);
    
    // Створюємо файл у пам'яті браузера і завантажуємо
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Генератор JSON файлів</h2>
      <p>Введіть дані, і програма згенерує JSON-файл для завантаження на диск.</p>
      <textarea 
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        style={{ width: '100%', height: '80px', marginBottom: '10px', padding: '10px' }}
      />
      <button onClick={generateAndDownload} style={btnStyle}>Згенерувати та завантажити JSON</button>
    </div>
  );
}

// ==========================================
// Вкладка 3: Трекер (додавання даних)
// ==========================================
function TrackerTab({ mediaItems, setMediaItems }) {
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title) return;
    
    const newItem = {
      id: Date.now(),
      title: title,
      review: review,
      rating: Number(rating)
    };
    
    setMediaItems([...mediaItems, newItem]);
    setTitle(''); setReview(''); setRating(5); // Очищення форми
  };

  return (
    <div>
      <h2>Трекер </h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Назва..." value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
        <textarea placeholder="Ваша рецензія..." value={review} onChange={e => setReview(e.target.value)} style={inputStyle} />
        <label>
          Оцінка (1-10): <input type="number" min="1" max="10" value={rating} onChange={e => setRating(e.target.value)} style={{width: '60px', ...inputStyle}} />
        </label>
        <button type="submit" style={btnStyle}>Додати запис</button>
      </form>

      <ul>
        {mediaItems.map(item => (
          <li key={item.id} style={{ marginBottom: '10px' }}>
            <strong>{item.title}</strong> (Оцінка: {item.rating}/10) <br/>
            <span style={{ color: '#555', fontSize: '14px' }}>"{item.review}"</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ==========================================
// Вкладка 4: Візуалізація даних
// ==========================================
function VisualizationsTab({ mediaItems }) {
  if (mediaItems.length === 0) return <p>Додайте дані у трекері для візуалізації!</p>;

  return (
    <div>
      <h2>Візуалізація даних</h2>
      
      {/* 1. Таблиця */}
      <h3>Дані у вигляді таблиці</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={tdStyle}>Назва</th>
            <th style={tdStyle}>Рецензія</th>
            <th style={tdStyle}>Оцінка</th>
          </tr>
        </thead>
        <tbody>
          {mediaItems.map(item => (
            <tr key={item.id}>
              <td style={tdStyle}>{item.title}</td>
              <td style={tdStyle}>{item.review}</td>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold' }}>{item.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 2. Стовпчаста діаграма (CSS) */}
      <h3>Діаграма оцінок</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '15px', padding: '10px', borderBottom: '2px solid #333', borderLeft: '2px solid #333' }}>
        {mediaItems.map(item => (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
            <span style={{ fontSize: '12px', marginBottom: '5px' }}>{item.rating}</span>
            <div style={{ 
              height: `${item.rating * 15}px`, 
              width: '100%', 
              background: 'linear-gradient(to top, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '4px 4px 0 0'
            }}></div>
            <span style={{ fontSize: '10px', marginTop: '5px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '60px' }}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Спеціальні стилі для UI
// ==========================================
const tabStyle = (isActive) => ({
  padding: '10px 20px',
  cursor: 'pointer',
  background: isActive ? '#007BFF' : '#e9ecef',
  color: isActive ? '#fff' : '#333',
  border: 'none',
  borderRadius: '5px',
  fontWeight: isActive ? 'bold' : 'normal',
  transition: '0.3s'
});

const btnStyle = {
  padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
};

const inputStyle = {
  padding: '8px', borderRadius: '4px', border: '1px solid #ccc'
};

const tdStyle = {
  border: '1px solid #ddd', padding: '8px', textAlign: 'left'
};

export default App;