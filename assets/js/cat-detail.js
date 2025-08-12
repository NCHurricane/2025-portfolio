// Cat Detail Page JavaScript

(function () {
  "use strict";

  // ============================================================================
  // LOCAL SCOPE - All variables and functions are now contained
  // ============================================================================

  // Local variables (no longer global)
  var currentCatData = null;
  var isLoaded = false;

  // ============================================================================
  // LOCAL FUNCTIONS - Cat detail functionality
  // ============================================================================

  // Format photo date for display
  function formatPhotoDate(dateString) {
    var date = new Date(dateString);
    var options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  // Display error message
  function showError(message) {
    var nameElement = document.getElementById("catName");
    var bioElement = document.getElementById("catBio");
    var galleryElement = document.getElementById("catGalleryGrid");

    if (nameElement) nameElement.textContent = "Error";
    if (bioElement) bioElement.textContent = message;
    if (galleryElement) {
      galleryElement.innerHTML =
        '<div class="col-12 text-center"><p class="text-danger">' +
        message +
        "</p></div>";
    }
  }

  function renderPhotoGallery(photos, catName) {
    var container = document.getElementById("catGalleryGrid");

    if (!photos || photos.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center"><p class="text-warning">No photos available for ' +
        catName +
        " yet.</p></div>";
      return;
    }

    // Clear loading state
    container.innerHTML = "";

    // Group photos by year WITHOUT sorting (preserve JSON order)
    var photosByYear = {};
    photos.forEach(function (photo) {
      var year = new Date(photo.date).getFullYear();
      if (!photosByYear[year]) photosByYear[year] = [];
      photosByYear[year].push(photo);
    });

    // Sort years ascending
    var years = Object.keys(photosByYear).sort(function (a, b) {
      return a - b;
    });

    // Render photos grouped by year
    years.forEach(function (year) {
      // Year header
      var yearHeader = document.createElement("div");
      yearHeader.className = "col-12 mb-3 mt-4";
      yearHeader.innerHTML =
        '\n            <div class="d-flex align-items-center">\n              <h3 class="me-2 mb-0">' +
        year +
        '</h3>\n              <span class="text-muted small">(' +
        photosByYear[year].length +
        ' photos)</span>\n            </div>\n            <hr class="year-separator">\n            ';
      container.appendChild(yearHeader);

      // Photos for this year
      photosByYear[year].forEach(function (photo) {
        var col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3 mb-4 gallery-item";

        // Format the date for display
        var photoDate = formatPhotoDate(photo.date);

        // Build anchor and children via DOM to avoid escaping issues; use data-description for HTML captions
        var a = document.createElement("a");
        a.href = photo.full;
        a.className = "glightbox";
        a.dataset.gallery = "cat-gallery";

        // Set GLightbox caption fields as plain strings
        a.dataset.title = photo.caption || "";
        a.dataset.description = photoDate + " • " + catName;

        var pic = document.createElement("div");
        pic.className = "gallery-pic";

        var imgEl = document.createElement("img");
        imgEl.src = photo.thumb;
        imgEl.alt = photo.caption || "";
        imgEl.loading = "lazy";
        imgEl.className = "img-fluid rounded shadow-sm";

        pic.appendChild(imgEl);
        a.appendChild(pic);
        col.appendChild(a);

        var titleEl = document.createElement("h5");
        titleEl.className = "mt-2";
        titleEl.innerHTML = "<strong>" + (photo.caption || "") + "</strong>";
        col.appendChild(titleEl);

        var hrEl = document.createElement("hr");
        col.appendChild(hrEl);

        container.appendChild(col);
      });
    });

    // (Re)initialize GLightbox for dynamically added anchors
    if (typeof GLightbox === "function") {
      if (
        window.nchurricatsLB &&
        typeof window.nchurricatsLB.reload === "function"
      ) {
        window.nchurricatsLB.reload();
      } else {
        window.nchurricatsLB = GLightbox({
          selector: "a.glightbox",
          touchNavigation: true,
          loop: false,
        });
      }

      const lb = window.nchurricatsLB;

      // Helper: mark a slide as portrait or not
      function markPortrait(slideNode) {
        if (!slideNode) return;
        const img = slideNode.querySelector(".gslide-image img");
        if (!img) return;

        const apply = () => {
          // Toggle class on the slide container
          if (img.naturalHeight > img.naturalWidth) {
            slideNode.classList.add("is-portrait");
          } else {
            slideNode.classList.remove("is-portrait");
          }
        };

        if (img.complete) apply();
        else img.addEventListener("load", apply, { once: true });
      }

      // When a slide is loaded/changed, (re)mark orientation
      lb.on && lb.on("slide_after_load", ({ slide }) => markPortrait(slide));
      lb.on &&
        lb.on("slide_changed", ({ current }) =>
          markPortrait(current && current.slideNode)
        );
    } else {
      console.warn("GLightbox not found. Did you include glightbox.min.js?");
    }
  }

  // Render cat detail page
  function renderCatDetail(catData) {
    // Store cat data locally
    currentCatData = catData;

    // Update page title
    document.title = catData.name + " Gallery - chuckcopeland.com";

    // Update header information
    var catNameElement = document.getElementById("catName");
    var catBioElement = document.getElementById("catBio");
    var catPhotoElement = document.getElementById("catPhoto");

    if (catNameElement) catNameElement.textContent = catData.name;
    if (catBioElement) catBioElement.textContent = catData.bio;

    // Add the cat photo
    if (catPhotoElement) {
      catPhotoElement.src = catData.cardThumbnail;
      catPhotoElement.alt = catData.name;
    }

    // Add memorial styling if applicable
    var headerContainer = document.getElementById("catDetailHeader");
    if (headerContainer && catData.memorial === "true") {
      headerContainer.classList.add("memorial");
    }

    // Render photo gallery with year grouping
    renderPhotoGallery(catData.photos, catData.name);
  }

  // Load cat data from JSON file
  function loadCatData(catName) {
    if (!catName) {
      showError("No cat specified in URL");
      return;
    }

    // Show loading state
    var galleryElement = document.getElementById("catGalleryGrid");
    if (galleryElement) {
      galleryElement.innerHTML = `
                <div class="col-12 text-center">
                    <div class="loading-photos">
                        <i class="fas fa-spinner fa-spin"></i>
                        Loading photos...
                    </div>
                </div>
            `;
    }

    // Load the cat's data
    fetch("../data/" + catName + ".json")
      .then(function (res) {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Cat data not found`);
        }
        return res.json();
      })
      .then(function (catData) {
        // Validate cat data
        if (!catData || !catData.name) {
          throw new Error("Invalid cat data format");
        }

        renderCatDetail(catData);
        isLoaded = true;
      })
      .catch(function (err) {
        console.error("Failed to load cat detail:", err);
        isLoaded = false;

        // Provide specific error messages
        var errorMessage;
        if (
          err.message.includes("HTTP 404") ||
          err.message.includes("Cat data not found")
        ) {
          errorMessage =
            "Cat information not found. Please check the URL or try again.";
        } else if (err.message.includes("JSON")) {
          errorMessage =
            "Cat data is corrupted. Please contact the site administrator.";
        } else if (err.message.includes("fetch")) {
          errorMessage =
            "Unable to connect to the server. Please check your internet connection.";
        } else {
          errorMessage = "Unable to load cat information. Please try again.";
        }

        showError(errorMessage);
      });
  }

  // ============================================================================
  // MAIN EXECUTION - Enhanced with better error handling
  // ============================================================================

  // Initialize when DOM is ready
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    // Get cat name from URL parameter
    var urlParams = new URLSearchParams(window.location.search);
    var catName = urlParams.get("name");

    // Validate and sanitize cat name
    if (catName) {
      catName = catName.replace(/[^a-zA-Z0-9\-]/g, ""); // Basic sanitization
      if (catName.length > 0) {
        loadCatData(catName);
      } else {
        showError("Invalid cat name in URL");
      }
    } else {
      showError("No cat specified in URL");
    }
  }

  // Start initialization
  init();

  // ============================================================================
  // PUBLIC API - Expose essential functionality for other scripts
  // ============================================================================
  window.ChuckPortfolio = window.ChuckPortfolio || {};

  // Expose cat detail functionality
  window.ChuckPortfolio.catDetail = {
    // Get current cat data
    getCurrentCat: function () {
      return currentCatData ? Object.assign({}, currentCatData) : null; // Return copy
    },

    // Check if cat data is loaded
    isLoaded: function () {
      return isLoaded;
    },

    // Reload current cat (useful for dynamic updates)
    reload: function () {
      var urlParams = new URLSearchParams(window.location.search);
      var catName = urlParams.get("name");
      if (catName) {
        currentCatData = null;
        isLoaded = false;
        loadCatData(catName);
      }
    },

    // Get photos for current cat
    getPhotos: function () {
      return currentCatData && currentCatData.photos
        ? currentCatData.photos.slice()
        : [];
    },

    // Get photos by year
    getPhotosByYear: function (year) {
      if (!currentCatData || !currentCatData.photos) return [];
      return currentCatData.photos.filter(function (photo) {
        return new Date(photo.date).getFullYear() === year;
      });
    },

    // NEW: cleanly destroy the GLightbox instance
    cleanup: function () {
      if (
        window.nchurricatsLB &&
        typeof window.nchurricatsLB.destroy === "function"
      ) {
        try {
          window.nchurricatsLB.destroy();
        } catch (e) {}
        window.nchurricatsLB = null; // allow a fresh init on next render
      }
    },

    version: "1.0.1-glb",
  };

  // Destroy GLightbox on page unload
  window.addEventListener("beforeunload", function () {
    if (window.ChuckPortfolio && window.ChuckPortfolio.catDetail) {
      window.ChuckPortfolio.catDetail.cleanup();
    }
  });
})(); // IIFE ends here - everything above is now in local scope
