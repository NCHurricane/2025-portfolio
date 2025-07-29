// Enhanced gallery.js with comprehensive error handling
// Uses namespaced IIFE pattern to prevent global pollution

(function () {
  'use strict';

  // ============================================================================
  // LOCAL SCOPE - All variables and functions are now contained
  // ============================================================================

  // Local functions (no longer global)
  function displayGalleryError(container, message, showRetry) {
    showRetry = showRetry !== false; // Default to true

    var retryButton = showRetry ? `
            <button class="btn btn-outline-warning mt-3" onclick="location.reload()">
                <i class="fas fa-redo"></i> Try Again
            </button>
        ` : '';

    container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning" role="alert">
                    <h5><i class="fas fa-exclamation-triangle"></i> Gallery Loading Issue</h5>
                    <p>${message}</p>
                    ${retryButton}
                </div>
            </div>
        `;
  }

  function validateImageData(images) {
    if (!Array.isArray(images)) {
      throw new Error('Gallery data is not in the expected format');
    }

    var validImages = images.filter(function (img) {
      // Check for required fields
      return img &&
        typeof img.thumb === 'string' && img.thumb.length > 0 &&
        typeof img.full === 'string' && img.full.length > 0 &&
        typeof img.caption === 'string' && img.caption.length > 0;
    });

    if (validImages.length === 0) {
      throw new Error('No valid images found in gallery data');
    }

    return validImages;
  }

  function createGalleryItem(img) {
    var fullCaption =
      `<h5>${img.caption}</h5>` +
      `<p class="lb-caption">${img.impDate || img.date} &bull; ` +
      `${img.location} &bull; ` +
      `${img.camera}</p>`;

    var escapedCaption = fullCaption.replace(/"/g, '&quot;');

    var col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3 mb-4 gallery-item";

    col.innerHTML = `
            <a href="${img.full}"
               data-lightbox="gallery"
               data-title="${escapedCaption}">
               <div class="gallery-pic">
                <img src="${img.thumb}"
                     alt="${img.caption}"
                     loading="lazy"
                     class="img-fluid rounded shadow-sm"
                     onerror="this.parentElement.parentElement.style.display='none'" />
                     </div>
            </a>
            <h5 class="mt-2"><strong>${img.caption}</strong></h5>
            <hr>
        `;

    return col;
  }

  // ============================================================================
  // MAIN EXECUTION - Same logic, now in local scope
  // ============================================================================

  // Main gallery loading function with error handling
  var galleryContainer = document.getElementById("galleryGrid");

  if (galleryContainer) {
    // Show initial loading state
    galleryContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-spinner fa-spin"></i> Loading photo gallery...
                </div>
            </div>
        `;

    fetch("data/gallery.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(function (images) {
        // Clear loading state
        galleryContainer.innerHTML = '';

        try {
          // Validate and filter the image data
          var validImages = validateImageData(images);

          // Create gallery items
          validImages.forEach(function (img) {
            try {
              var galleryItem = createGalleryItem(img);
              galleryContainer.appendChild(galleryItem);
            } catch (itemError) {
              console.warn('Skipping invalid gallery item:', img, itemError);
            }
          });

          // Check if any items were actually created
          if (galleryContainer.children.length === 0) {
            throw new Error('No gallery items could be created');
          }

        } catch (validationError) {
          console.error("Gallery validation error:", validationError);
          displayGalleryError(
            galleryContainer,
            "There was a problem processing the gallery data. The images may be in an unexpected format."
          );
        }
      })
      .catch(function (err) {
        console.error("Failed to load gallery:", err);

        // Provide specific error messages based on error type
        var errorMessage;
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorMessage = "Unable to connect to the server. Please check your internet connection.";
        } else if (err.message.includes('HTTP 404')) {
          errorMessage = "Gallery data file not found. Please contact the site administrator.";
        } else if (err.message.includes('JSON')) {
          errorMessage = "Gallery data is corrupted or in an invalid format.";
        } else {
          errorMessage = "Unable to load photo gallery. Please try refreshing the page.";
        }

        displayGalleryError(galleryContainer, errorMessage);
      });
  }

  // ============================================================================
  // OPTIONAL: EXPOSE PUBLIC API (only if needed by other scripts)
  // ============================================================================

  // Create namespace if it doesn't exist
  window.ChuckPortfolio = window.ChuckPortfolio || {};

  // Expose only what's needed globally (in this case, probably nothing)
  window.ChuckPortfolio.gallery = {
    // Example: if other scripts needed to trigger gallery reload
    // reload: function() { /* implementation */ }

    // Most likely you won't need to expose anything for gallery.js
    version: '1.0.0' // Just for demo
  };

})(); // IIFE ends here - everything above is now in local scope