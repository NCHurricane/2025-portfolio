document.addEventListener('DOMContentLoaded', function () {
    // Get cat name from URL parameter
    var urlParams = new URLSearchParams(window.location.search);
    var catName = urlParams.get('name');

    if (!catName) {
        showError('No cat specified in URL');
        return;
    }

    // Load the cat's data
    fetch('../data/' + catName + '.json')
        .then(function (res) {
            if (!res.ok) {
                throw new Error('Cat data not found');
            }
            return res.json();
        })
        .then(function (catData) {
            renderCatDetail(catData);
        })
        .catch(function (err) {
            console.error('Failed to load cat detail:', err);
            showError('Unable to load cat information. Please try again.');
        });
});

function renderCatDetail(catData) {
    // Update page title
    document.title = catData.name + ' Gallery - chuckcopeland.com';

    // Update header information
    document.getElementById('catName').textContent = catData.name;
    document.getElementById('catBio').textContent = catData.bio;

    // Add the cat photo
    var catPhoto = document.getElementById('catPhoto');
    catPhoto.src = catData.cardThumbnail;
    catPhoto.alt = catData.name;

    // Add memorial styling if applicable
    var headerContainer = document.getElementById('catDetailHeader');
    if (catData.memorial === "true") {
        headerContainer.classList.add('memorial');
    }

    // Render photo gallery with year grouping
    renderPhotoGallery(catData.photos, catData.name);
}

// OPTION 1: Preserve JSON Order (Simplest)
function renderPhotoGallery(photos, catName) {
    var container = document.getElementById('catGalleryGrid');

    if (!photos || photos.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-warning">No photos available for ' + catName + ' yet.</p></div>';
        return;
    }

    // Clear loading state
    container.innerHTML = '';

    // Group photos by year WITHOUT sorting
    var photosByYear = {};

    photos.forEach(function (photo, index) {
        var year = new Date(photo.date).getFullYear();
        if (!photosByYear[year]) {
            photosByYear[year] = [];
        }
        // Add original index to preserve order
        photo.originalIndex = index;
        photosByYear[year].push(photo);
    });

    // Sort years in descending order (newest first)
    var years = Object.keys(photosByYear).sort(function (a, b) {
        return a - b;
    });

    // Render photos grouped by year
    years.forEach(function (year) {
        // Add year header
        var yearHeader = document.createElement('div');
        yearHeader.className = 'col-12 mb-3 mt-4';
        yearHeader.innerHTML = `
            <h3 class="year-divider">
                <span class="year-text">${year}</span>
                <span class="photo-count">(${photosByYear[year].length} photo${photosByYear[year].length > 1 ? 's' : ''})</span>
            </h3>
            <hr class="year-separator">
        `;
        container.appendChild(yearHeader);

        // Render photos for this year
        photosByYear[year].forEach(function (photo) {
            var col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3 mb-4 gallery-item';

            // Format the date for display
            var photoDate = formatPhotoDate(photo.date);

            // Create caption with cat name, date, and photo caption
            var fullCaption =
                '<h5>' + photo.caption + '</h5>' +
                '<p class="lb-caption">' + photoDate + ' &bull; ' + catName + '</p>';

            var escapedCaption = fullCaption.replace(/"/g, '&quot;');

            col.innerHTML =
                '<a href="' + photo.full + '"' +
                ' data-lightbox="cat-gallery"' +
                ' data-title="' + escapedCaption + '">' +
                '<div class="gallery-pic">' +
                '<img src="' + photo.thumb + '"' +
                ' alt="' + photo.caption + '"' +
                ' loading="lazy"' +
                ' class="img-fluid rounded shadow-sm" />' +
                '</div>' +
                '</a>' +
                '<h5 class="mt-2"><strong>' + photo.caption + '</strong></h5>' +
                '<hr>';

            container.appendChild(col);
        });
    });
}

function formatPhotoDate(dateString) {
    var date = new Date(dateString);
    var options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function showError(message) {
    var nameElement = document.getElementById('catName');
    var bioElement = document.getElementById('catBio');
    var galleryElement = document.getElementById('catGalleryGrid');

    nameElement.textContent = 'Error';
    bioElement.textContent = message;
    galleryElement.innerHTML = '<div class="col-12 text-center"><p class="text-danger">' + message + '</p></div>';
}