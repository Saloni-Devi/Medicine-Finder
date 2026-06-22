const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const loader = document.getElementById('loader');

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (!query) return;

  resultsDiv.innerHTML = '';
  errorDiv.innerHTML = '';
  loader.style.display = 'block';

  try {
    const url = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:"${query}"+openfda.generic_name:"${query}")&limit=6`;
    const response = await fetch(url);

    if (!response.ok) throw new Error('Not found');

    const data = await response.json();
    displayResults(data.results);
  } catch (error) {
    resultsDiv.innerHTML = `<p class="no-result">No medicines found for "${query}". Try: Paracetamol, Ibuprofen</p>`;
  } finally {
    loader.style.display = 'none';
  }
});

function displayResults(medicines) {
  if (!medicines || medicines.length === 0) {
    resultsDiv.innerHTML = '<p class="no-result">No results found</p>';
    return;
  }

  resultsDiv.innerHTML = medicines.map((med, index) => {
    const brandName = med.openfda?.brand_name?.[0] || 'N/A';
    const genericName = med.openfda?.generic_name?.[0] || 'N/A';
    const purpose = med.purpose?.[0] || 'Not specified';

    const uniqueId = med.openfda?.unii?.[0] || `med_${Date.now()}_${index}`;
    med.id = uniqueId;

    localStorage.setItem(`med_${uniqueId}`, JSON.stringify(med));

    return `
      <div class="card">
        <h3>${brandName}</h3>
        <p><strong>Generic:</strong> ${genericName}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <div class="card-actions">
          <button class="btn-details" onclick="viewDetails('${uniqueId}')">View Details</button>
          <button class="btn-save" onclick="addToWatchlist('${uniqueId}')">Save</button>
        </div>
      </div>
    `;
  }).join('');
}

function addToWatchlist(id) {
  let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const med = JSON.parse(localStorage.getItem(`med_${id}`));

  if (!med) {
    alert('Error: Medicine data not found!');
    return;
  }

  if (!watchlist.find(item => item.id === id)) {
    watchlist.push(med);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert('Added to Watchlist!');
  } else {
    alert('Already in Watchlist');
  }
}

function viewDetails(id) {
  window.location.href = `details.html?id=${id}`;
}
