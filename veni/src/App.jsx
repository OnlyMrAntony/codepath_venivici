import { useState } from 'react'

import './App.css'

function App() {
  const [currentItem, setCurrentItem] = useState(null)
  const [banList, setBanList] = useState([])
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRandomCat = async () => {
    setIsLoading(true);
    let attempts = 0;
    const maxAttempts = 15;

    try {
      while (attempts < maxAttempts) {
        attempts++;
        
        // 🔑 THE DIFFERENCE: We add headers to pass the API key from the .env file
        const response = await fetch('https://api.thecatapi.com/v1/images/search?has_breeds=1', {
          headers: {
            'x-api-key': import.meta.env.VITE_CAT_API_KEY
          }
        });
        
        const data = await response.json();
        const rawCat = data[0]; 
        if (!rawCat || !rawCat.breeds || rawCat.breeds.length === 0) continue;

        const breedInfo = rawCat.breeds[0];

        const formattedCat = {
          id: rawCat.id,
          url: rawCat.url,
          name: breedInfo.name,
          origin: breedInfo.origin,
          temperament: breedInfo.temperament ? breedInfo.temperament.split(', ')[0] : 'Unknown',
        };

        const isBanned = 
          banList.includes(formattedCat.name) ||
          banList.includes(formattedCat.origin) ||
          banList.includes(formattedCat.temperament);

        if (!isBanned) {
          if (currentItem) {
            setHistory((prev) => [currentItem, ...prev]);
          }
          setCurrentItem(formattedCat);
          setIsLoading(false);
          return;
        }
      }

      alert("Too many items are banned! Please unban some to keep exploring.");
      setIsLoading(false);

    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  // 3. Helper Interactions
  const addToBanList = (attr) => {
    if (attr && !banList.includes(attr)) setBanList([...banList, attr]);
  };

  const removeFromBanList = (attrToRemove) => {
    setBanList(banList.filter((item) => item !== attrToRemove));
  };

  return (
    <div className="app-container">
      {/* History Sidebar */}
      <div className="sidebar history-panel">
        <h3>Seen History</h3>
        <div className="history-list">
          {history.map((item, index) => (
            <div key={`${item.id}-${index}`} className="history-item">
              <img src={item.url} alt={item.name} className="history-thumb" />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Sandbox Window */}
      <div className="main-content">
        <h1>🐾 Cat Stumbler</h1>
        <p>Discover new cat breeds, ban the ones you know!</p>
        
        <button className="discover-btn" onClick={fetchRandomCat} disabled={isLoading}>
          {isLoading ? 'Searching...' : '🔀 Discover Next!'}
        </button>

        {currentItem ? (
          <div className="card">
            <div className="attribute-buttons">
              <button onClick={() => addToBanList(currentItem.name)}> Breed: {currentItem.name}</button>
              <button onClick={() => addToBanList(currentItem.origin)}> Origin: {currentItem.origin}</button>
              <button onClick={() => addToBanList(currentItem.temperament)}> Trait: {currentItem.temperament}</button>
            </div>
            <div className="image-container">
              <img src={currentItem.url} alt="Discovered cat" className="main-image" />
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Ready to stumble? Click the button above to load your first result!</p>
          </div>
        )}
      </div>

      {/* Ban List Sidebar */}
      <div className="sidebar ban-panel">
        <h3>Ban List</h3>
        <span className="hint">Click an item to unban it</span>
        <div className="ban-tags">
          {banList.map((bannedAttr, idx) => (
            <button key={idx} className="ban-tag" onClick={() => removeFromBanList(bannedAttr)}>
              ❌ {bannedAttr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


export default App
