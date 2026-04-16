const API_BASE = 'https://api.mangadex.org';
const COVER_BASE = 'https://uploads.mangadex.org/covers'


const grid = document.getElementById('results');

const toggleFavorite = (mangaId) => {
  let favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
  const index = favorites.indexOf(mangaId);

  if (index > -1) {
    favorites.splice(index, 1);
    alert("Removed from favorites!");
  } else {
    favorites.push(mangaId);
    alert("Added to favorites!");
  }

  localStorage.setItem('myFavorites', JSON.stringify(favorites));
};

const createCard = (manga) => {
  const attrs = manga.attributes;
  const title = attrs.title.en || Object.values(attrs.title)[0] || "No Title";
  const status = attrs.status;
  const coverObj = manga.relationships.find(r => r.type === 'cover_art');
  const fileName = coverObj?.attributes?.fileName;
  const img = fileName ? `${COVER_BASE}/${manga.id}/${fileName}.256.jpg` : 'https://placehold.co';

  return `
    <div class="card">
      <div class="badge ${status}">${status}</div>
      <img src="${img}" alt="${title}" loading="lazy">
      <p title="${title}">${title}</p>
      <button class="fav-btn" onclick="toggleFavorite('${manga.id}')"> Favorite</button>
    </div>`;
};

const performSearch = async () => {
  const query = document.getElementById('manga-input').value.trim();
  if (!query) return;
  grid.innerHTML = "<p>Searching...</p>";
  try {
    const url = `${API_BASE}/manga?title=${encodeURIComponent(query)}&originalLanguage[]=ko&includes[]=cover_art&limit=15`;
    const res = await fetch(url);
    const { data } = await res.json();
    grid.innerHTML = data.map(manga => createCard(manga)).join('');
  } catch (err) {
    grid.innerHTML = "<p>Error loading images. Check your connection.</p>";
    console.error(err);
  }
};

const loadFavourites = async () => {
  const favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
  if (favorites.length === 0) return alert("No favorites saved!");
  
  grid.innerHTML = "<p>Loading favorites...</p>";
  
  const idParams = favorites.map(id => `ids[]=${id}`).join('&');
  const url = `${API_BASE}/manga?${idParams}&includes[]=cover_art`;
  
  try {
    const res = await fetch(url);
    const { data } = await res.json();
    grid.innerHTML = data.map(manga => createCard(manga)).join('');
  } catch (err) {
    grid.innerHTML = "<p>Error loading favorites.</p>";
    console.error(err);
  }
};

document.getElementById('search-btn').onclick = performSearch;

const favBtn = document.getElementById('view-favs-btn');
if (favBtn) favBtn.onclick = loadFavourites;

document.getElementById('manga-input').onkeypress = (e) => {
  if (e.key === 'Enter') performSearch();
};
