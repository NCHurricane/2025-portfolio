// Video projects functionality - OPTIMIZED VERSION
(function () {
  'use strict';

  var projectsData = [];
  var isLoaded = false;

  // DOM Cache
  var cachedContainer = null;

  // Get cached container with safety checks
  function getContainer() {
    if (!cachedContainer || !cachedContainer.parentNode) {
      cachedContainer = document.getElementById("project-grid");
    }
    return cachedContainer;
  }

  function renderProjectsGrid(projects, container) {
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

  function displayProjectsError(container, message) {
    container.innerHTML = `<p class='text-danger'>${message}</p>`;
  }

  function loadProjects() {
    var container = getContainer();

    if (!container) {
      console.warn('Projects container not found - projects.js may be loaded on wrong page');
      return;
    }

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
        projectsData = projects;
        isLoaded = true;

        if (!Array.isArray(projects) || projects.length === 0) {
          throw new Error('No valid projects found');
        }

        renderProjectsGrid(projects, container);
      })
      .catch(function (err) {
        console.error("Error loading projects:", err);
        isLoaded = false;

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

  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', function () {
    loadProjects();
  });

  // Public API
  window.ChuckPortfolio = window.ChuckPortfolio || {};
  window.ChuckPortfolio.projects = {
    reload: function () {
      projectsData = [];
      isLoaded = false;
      loadProjects();
    },
    getProjects: function () {
      return projectsData.slice();
    },
    isLoaded: function () {
      return isLoaded;
    },
    getProject: function (id) {
      return projectsData.find(function (project) {
        return project.id === id;
      });
    },
    getProjectsByClient: function (clientName) {
      return projectsData.filter(function (project) {
        return project.client && project.client.toLowerCase().includes(clientName.toLowerCase());
      });
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