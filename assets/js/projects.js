// Load and display video projects
// Enhanced with namespaced IIFE pattern to prevent global pollution

(function () {
  'use strict';

  // ============================================================================
  // LOCAL SCOPE - All variables and functions are now contained
  // ============================================================================

  // Local variables (no longer global)
  var projectsData = [];
  var isLoaded = false;

  // Local function to render projects grid
  function renderProjectsGrid(projects, container) {
    // Clear any existing content
    container.innerHTML = '';

    projects.forEach(function (project) {
      container.innerHTML += `
                <div class="col-md-6 col-lg-3 mb-4">
                    <a href="video-detail.html?id=${project.id}" class="text-decoration-none">
                        <div class="video-card">
                            <img src="${project.thumbnail}" alt="${project.title}" loading="lazy" class="img-fluid" />
                            <i class="fa-regular fa-circle-play play-icon"></i>
                        </div>
                    </a>
                    <h5 class="mt-2 text-light"><strong>${project.title}</strong></h5>
                    <hr>
                </div>
            `;
    });
  }

  // Local function to display error message
  function displayProjectsError(container, message) {
    container.innerHTML = `<p class='text-danger'>${message}</p>`;
  }

  // Local function to load projects data
  function loadProjects() {
    var container = document.getElementById("project-grid");

    if (!container) {
      console.warn('Projects container not found - projects.js may be loaded on wrong page');
      return;
    }

    // Show loading state
    container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-spinner fa-spin"></i> Loading video projects...
                </div>
            </div>
        `;

    fetch("data/projects.json")
      .then(function (res) {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(function (projects) {
        // Store data locally
        projectsData = projects;
        isLoaded = true;

        // Validate data
        if (!Array.isArray(projects) || projects.length === 0) {
          throw new Error('No valid projects found');
        }

        // Render the projects
        renderProjectsGrid(projects, container);
      })
      .catch(function (err) {
        console.error("Error loading projects:", err);
        isLoaded = false;

        // Provide specific error messages
        var errorMessage;
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorMessage = "Unable to connect to the server. Please check your internet connection.";
        } else if (err.message.includes('HTTP 404')) {
          errorMessage = "Projects data file not found. Please contact the site administrator.";
        } else if (err.message.includes('JSON')) {
          errorMessage = "Projects data is corrupted or in an invalid format.";
        } else {
          errorMessage = "Unable to load video projects. Please try refreshing the page.";
        }

        displayProjectsError(container, errorMessage);
      });
  }

  // ============================================================================
  // MAIN EXECUTION - Same logic, now in local scope
  // ============================================================================

  // Initialize when page loads - using DOMContentLoaded for better practice
  document.addEventListener('DOMContentLoaded', function () {
    loadProjects();
  });

  // ============================================================================
  // OPTIONAL: EXPOSE PUBLIC API (if needed by other scripts)
  // ============================================================================

  // Create namespace if it doesn't exist
  window.ChuckPortfolio = window.ChuckPortfolio || {};

  // Expose useful functionality for other scripts
  window.ChuckPortfolio.projects = {
    // Reload projects if needed
    reload: function () {
      projectsData = [];
      isLoaded = false;
      loadProjects();
    },

    // Get projects data (useful for other scripts)
    getProjects: function () {
      return projectsData.slice(); // Return copy to prevent external modification
    },

    // Check if projects are loaded
    isLoaded: function () {
      return isLoaded;
    },

    // Get specific project by ID (useful for detail page)
    getProject: function (id) {
      return projectsData.find(function (project) {
        return project.id === id;
      });
    },

    // Get projects by criteria (useful for filtering)
    getProjectsByClient: function (clientName) {
      return projectsData.filter(function (project) {
        return project.client && project.client.toLowerCase().includes(clientName.toLowerCase());
      });
    },

    version: '1.0.0'
  };

})(); // IIFE ends here - everything above is now in local scope