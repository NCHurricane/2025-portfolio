// Cats gallery functionality
(function () {
    'use strict';

    var catFiles = ['bailey', 'teddy', 'stormy', 'bella-grace', 'bella'];
    var catsData = [];
    var loadedCount = 0;

    // DOM Cache
    var cachedContainer = null;

    // Get cached container with safety checks
    function getContainer() {
        if (!cachedContainer || !cachedContainer.parentNode) {
            cachedContainer = document.getElementById('catsGrid');
        }
        return cachedContainer;
    }

    function loadCatData() {
        catFiles.forEach(function (catName) {
            fetch('../data/' + catName + '.json')
                .then(function (res) {
                    return res.json();
                })
                .then(function (catData) {
                    catsData.push(catData);
                    loadedCount++;

                    if (loadedCount === catFiles.length) {
                        renderCatsGrid();
                    }
                })
                .catch(function (err) {
                    console.error('Failed to load ' + catName + ' data:', err);
                    loadedCount++;

                    var container = getContainer();
                    if (container && loadedCount === 1) {
                        var errorDiv = document.createElement('div');
                        errorDiv.className = 'col-12 text-center mb-3';
                        errorDiv.innerHTML = '<p class="text-warning"><i class="fas fa-exclamation-triangle"></i> Some cat information could not be loaded.</p>';
                        container.appendChild(errorDiv);
                    }

                    if (loadedCount === catFiles.length) {
                        renderCatsGrid();
                    }
                });
        });
    }

    function renderCatsGrid() {
        var container = getContainer();

        if (catsData.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Unable to load cat information.</p></div>';
            return;
        }

        container.innerHTML = '';

        var displayOrder = ['Bailey', 'Teddy', 'Stormy', 'Bella Grace', 'Bella'];
        catsData.sort(function (a, b) {
            return displayOrder.indexOf(a.name) - displayOrder.indexOf(b.name);
        });

        catsData.forEach(function (cat) {
            var col = document.createElement('div');
            col.className = 'col-6 mb-4';

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

    function displayCatsError(message) {
        var container = getContainer();
        container.innerHTML =
            '<div class="col-12 text-center">' +
            '<div class="alert alert-warning" role="alert">' +
            '<h5><i class="fas fa-exclamation-triangle"></i> Cats Loading Issue</h5>' +
            '<p>' + message + '</p>' +
            '<button class="btn btn-outline-warning mt-3" onclick="location.reload()">' +
            '<i class="fas fa-redo"></i> Try Again' +
            '</button>' +
            '</div>' +
            '</div>';
    }

    function handleCatLoadingError(error) {
        console.error('Cat loading error:', error);

        var errorMessage;
        if (error.message && error.message.includes('fetch')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message && error.message.includes('404')) {
            errorMessage = 'Cat data files not found. Please contact the site administrator.';
        } else if (error.message && error.message.includes('JSON')) {
            errorMessage = 'Cat data is corrupted or in an invalid format.';
        } else {
            errorMessage = 'Unable to load cat information. Please try refreshing the page.';
        }

        displayCatsError(errorMessage);
    }

    function loadCatDataWithErrorHandling() {
        var container = getContainer();

        container.innerHTML =
            '<div class="col-12 text-center">' +
            '<div class="loading-cats">' +
            '<i class="fas fa-spinner fa-spin"></i>' +
            'Loading the cats...' +
            '</div>' +
            '</div>';

        catsData = [];
        loadedCount = 0;

        var loadPromises = catFiles.map(function (catName) {
            return fetch('../data/' + catName + '.json')
                .then(function (res) {
                    if (!res.ok) {
                        throw new Error('HTTP ' + res.status + ': ' + res.statusText);
                    }
                    return res.json();
                })
                .then(function (catData) {
                    if (!catData.name || !catData.cardThumbnail) {
                        throw new Error('Invalid cat data structure for ' + catName);
                    }
                    return catData;
                })
                .catch(function (err) {
                    console.warn('Failed to load ' + catName + ':', err);
                    return null;
                });
        });

        Promise.all(loadPromises)
            .then(function (results) {
                catsData = results.filter(function (cat) { return cat !== null; });

                if (catsData.length === 0) {
                    throw new Error('No cat data could be loaded');
                }

                renderCatsGrid();
            })
            .catch(handleCatLoadingError);
    }

    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', function () {
        var container = getContainer();
        if (container) {
            loadCatDataWithErrorHandling();
        }
    });

    // Public API
    window.ChuckPortfolio = window.ChuckPortfolio || {};
    window.ChuckPortfolio.cats = {
        reload: function () {
            var container = getContainer();
            if (container) {
                loadCatDataWithErrorHandling();
            }
        },
        getCatsData: function () {
            return catsData.slice();
        },
        isLoaded: function () {
            return loadedCount === catFiles.length && catsData.length > 0;
        },
        version: '1.0.0'
    };

})();

window.addEventListener('beforeunload', function () {
    if (window.ChuckPortfolio && window.ChuckPortfolio.lightbox) {
        window.ChuckPortfolio.lightbox.cleanup();
    }
});

window.addEventListener('pagehide', function () {
    if (window.ChuckPortfolio && window.ChuckPortfolio.lightbox) {
        window.ChuckPortfolio.lightbox.cleanup();
    }
});