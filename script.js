const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const errorMsg = document.getElementById('errorMsg');
const loader = document.getElementById('loader');

// Search functionality
if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (query === '') {
            errorMsg.textContent = 'Please enter a medicine name';
            resultsDiv.innerHTML = '';
            return;
        }
        
        errorMsg.textContent = '';
        loader.style.display = 'block';
        resultsDiv.innerHTML = '';

        try {
            const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"+openfda.generic_name:"${query}"&limit=6`;
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
}

// Results dikhana + Save button
function displayResults(medicines) {
    if (!medicines || medicines.length === 0) {
        resultsDiv.innerHTML = '<p class="no-result">No results found</p>';
        return;
    }

    resultsDiv.innerHTML = medicines.map((med, index) => {
        const brandName = med.openfda?.brand_name?.[0] || 'N/A';
        const genericName = med.openfda?.generic_name?.[0] || 'N/A';
        const purpose = med.purpose?.[0] || 'Not specified';
        const id = med.id || index;
        
        // Data ko localStorage ke liye save karenge
        localStorage.setItem(`med_${id}`, JSON.stringify(med));

        return `
            <div class="card">
                <h3>${brandName}</h3>
                <p><strong>Generic:</strong> ${genericName}</p>
                <p><strong>Purpose:</strong> ${purpose}</p>
                <div class="card-actions">
                    <button onclick="viewDetails('${id}')">View Details</button>
                    <button onclick="addToWatchlist('${id}')" class="save-btn">Save</button>
                </div>
            </div>
        `;
    }).join('');
}

// Watchlist me add karna
function addToWatchlist(id) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const med = JSON.parse(localStorage.getItem(`med_${id}`));
    
    if (!watchlist.find(item => item.id === id)) {
        watchlist.push({ id, ...med });
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert('Added to Watchlist!');
    } else {
        alert('Already in Watchlist');
    }
}

// Details page pe bhejna
function viewDetails(id) {
    window.location.href = `details.html?id=${id}`;
}