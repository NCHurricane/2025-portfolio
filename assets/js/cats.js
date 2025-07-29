// Enhanced cats.js with namespaced IIFE pattern to prevent global pollution

(function () {
    'use strict';

    // ============================================================================
    // LOCAL SCOPE - All variables and functions are now contained
    // ============================================================================

    // Local variables (no longer global)
    var catFiles = ['bailey', 'teddy', 'stormy', 'bella-grace', 'bella'];
    var catsData = [];
    var loadedCount = 0;

    // Local functions (no longer global)
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

                    // Show user feedback for failed cat
                    var container = document.getElementById('catsGrid');
                    if (container && loadedCount === 1) {
                        // Only show error on first failure, not for each cat
                        var errorDiv = document.createElement('div');
                        errorDiv.className = 'col-12 text-center mb-3';
                        errorDiv.innerHTML = '<p class="text-warning"><i class="fas fa-exclamation-triangle"></i> Some cat information could not be loaded.</p>';
                        container.appendChild(errorDiv);
                    }

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

    // Helper function for error handling (local)
    function displayCatsError(message) {
        var container = document.getElementById('catsGrid');
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

    // Enhanced error handling function (local)
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

    // Enhanced loading function with better error handling
    function loadCatDataWithErrorHandling() {
        var container = document.getElementById('catsGrid');

        // Show loading state
        container.innerHTML =
            '<div class="col-12 text-center">' +
            '<div class="loading-cats">' +
            '<i class="fas fa-spinner fa-spin"></i>' +
            'Loading the cats...' +
            '</div>' +
            '</div>';

        // Reset counters
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
                    // Validate basic cat data structure
                    if (!catData.name || !catData.cardThumbnail) {
                        throw new Error('Invalid cat data structure for ' + catName);
                    }
                    return catData;
                })
                .catch(function (err) {
                    console.warn('Failed to load ' + catName + ':', err);
                    return null; // Return null for failed loads
                });
        });

        // Wait for all promises to complete
        Promise.all(loadPromises)
            .then(function (results) {
                // Filter out null results (failed loads)
                catsData = results.filter(function (cat) { return cat !== null; });

                if (catsData.length === 0) {
                    throw new Error('No cat data could be loaded');
                }

                renderCatsGrid();
            })
            .catch(handleCatLoadingError);
    }

    // ============================================================================
    // INITIALIZATION (same trigger, enhanced execution)
    // ============================================================================

    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', function () {
        // Check if we're on the cats page
        var container = document.getElementById('catsGrid');
        if (container) {
            loadCatDataWithErrorHandling();
        }
    });

    // ============================================================================
    // OPTIONAL: EXPOSE PUBLIC API (only if needed by other scripts)
    // ============================================================================

    // Create namespace if it doesn't exist
    window.ChuckPortfolio = window.ChuckPortfolio || {};

    // Expose only essential functionality that other scripts might need
    window.ChuckPortfolio.cats = {
        // Example: if other scripts needed to trigger reload
        reload: function () {
            if (document.getElementById('catsGrid')) {
                loadCatDataWithErrorHandling();
            }
        },

        // Example: if other scripts needed to check loading state
        getCatsData: function () {
            // Return copy to prevent external modification
            return catsData.slice();
        },

        // Example: if other scripts needed to check if cats are loaded
        isLoaded: function () {
            return loadedCount === catFiles.length && catsData.length > 0;
        },

        version: '1.0.0'
    };

})(); // IIFE ends here - everything above is now in local scope