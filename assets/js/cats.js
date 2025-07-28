// Get all cat data files and build the cards
var catFiles = ['bailey', 'teddy', 'stormy', 'bella-grace', 'bella'];
var catsData = [];
var loadedCount = 0;

function loadCatData() {
    catFiles.forEach(function (catName) {
        fetch('../data/' + catName + '.json')
            .then(function (res) {
                return res.json();
            })
            .then(function (catData) {
                catsData.push(catData);
                loadedCount++;

                // Once all cats are loaded, render the grid
                if (loadedCount === catFiles.length) {
                    renderCatsGrid();
                }
            })
            .catch(function (err) {
                console.error('Failed to load ' + catName + ' data:', err);
                loadedCount++;

                // Still check if we should render with partial data
                if (loadedCount === catFiles.length) {
                    renderCatsGrid();
                }
            });
    });
}

function renderCatsGrid() {
    var container = document.getElementById('catsGrid');

    if (catsData.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Unable to load cat information.</p></div>';
        return;
    }

    // Clear loading state
    container.innerHTML = '';

    // Sort cats by name for consistent display
    var displayOrder = ['Bailey', 'Teddy', 'Stormy', 'Bella Grace', 'Bella'];
    catsData.sort(function (a, b) {
        return displayOrder.indexOf(a.name) - displayOrder.indexOf(b.name);
    });

    catsData.forEach(function (cat) {
        var col = document.createElement('div');
        col.className = 'col-md-6 mb-4';

        // Generate the URL-safe cat name
        var catUrlName = cat.name.toLowerCase().replace(/\s+/g, '-');

        col.innerHTML =
            '<div class="cat-card' + (cat.memorial ? ' memorial-cat' : '') + '">' +
            '<div class="cat-image-container">' +
            '<a href="cat-detail.html?name=' + catUrlName + '">' +
            '<img src="' + cat.cardThumbnail + '" alt="' + cat.name + '" loading="lazy" class="cat-card-image" />' +
            '</a>' +
            '</div>' +
            '<div class="cat-info">' +
            '<a href="cat-detail.html?name=' + catUrlName + '" class="cat-name-link">' +
            '<h3 class="cat-name">' + cat.name + '</h3>' +
            '<p class="cat-birth-year">' + cat.birthYear + '</p>' +
            '<div class="cat-divider"></div>' +
            '<div class="cat-bio">' + cat.shortBio + '</div>' +
            '</div>' +
            '</div>' +
            '</a>';

        container.appendChild(col);
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadCatData();
});