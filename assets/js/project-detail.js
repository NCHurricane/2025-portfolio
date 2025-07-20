// ============================================================================
// UTILITY FUNCTIONS - Define once at the top
// ============================================================================

// URL sanitization function
function sanitizeProjectId(id) {
  if (!id) return null;
  var sanitized = id.replace(/[^a-zA-Z0-9\-_]/g, '');
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }
  return sanitized.length > 0 ? sanitized : null;
}

// Helper function to hide loading state
function hideLoading() {
  const loadingElement = document.querySelector('.video-loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

// Helper function to generate poster image path from video URL
function generatePosterPath(videoUrl) {
  const videoName = videoUrl.split('/').pop().replace(/\.(mp4|webm|ogg)$/i, '');
  return `assets/video/gallery/thumbs/${videoName}.webp`;
}

// Helper function to determine video type
function getVideoType(videoUrl) {
  if (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
    return 'YouTube Video';
  } else if (videoUrl.includes('vimeo')) {
    return 'Vimeo Video';
  } else if (videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.includes('.ogg')) {
    return 'Self-Hosted Video';
  } else {
    return 'Embedded Video';
  }
}

// Format time helper
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// VIDEO CONTROL FUNCTIONS
// ============================================================================

// Global cleanup registry to track all event listeners
var videoEventRegistry = {
  listeners: [],

  // Add a listener to the registry
  add: function (element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.listeners.push({
      element: element,
      event: event,
      handler: handler,
      options: options
    });
  },

  // Remove all registered listeners
  cleanup: function () {
    this.listeners.forEach(function (listener) {
      listener.element.removeEventListener(listener.event, listener.handler, listener.options);
    });
    this.listeners = [];
    console.log('Video event listeners cleaned up');
  }
};

// Setup custom play button overlay for better UX
function setupPlayButtonOverlay(video) {
  const wrapper = video.closest('.video-wrapper');

  const playOverlay = document.createElement('div');
  playOverlay.className = 'video-play-overlay';
  playOverlay.innerHTML = `
    <div class="play-button">
      <i class="fas fa-play"></i>
    </div>
  `;

  wrapper.appendChild(playOverlay);

  // Use registry for all event listeners
  videoEventRegistry.add(video, 'play', function () {
    playOverlay.style.opacity = '0';
    playOverlay.style.pointerEvents = 'none';
  });

  videoEventRegistry.add(video, 'pause', function () {
    if (!video.ended) {
      playOverlay.style.opacity = '1';
      playOverlay.style.pointerEvents = 'auto';
    }
  });

  videoEventRegistry.add(video, 'ended', function () {
    playOverlay.style.opacity = '1';
    playOverlay.style.pointerEvents = 'auto';
    playOverlay.querySelector('i').className = 'fas fa-redo';
  });

  videoEventRegistry.add(playOverlay, 'click', function () {
    if (video.ended) {
      video.currentTime = 0;
      playOverlay.querySelector('i').className = 'fas fa-play';
    }
    video.play();
  });
}

// Setup custom video controls
function setupCustomControls(video) {
  const wrapper = video.closest('.video-wrapper');
  const controls = wrapper.querySelector('.custom-video-controls');
  const playPauseBtn = controls.querySelector('.play-pause-btn');
  const muteBtn = controls.querySelector('.mute-btn');
  const fullscreenBtn = controls.querySelector('.fullscreen-btn');
  const progressBar = controls.querySelector('.progress-bar');
  const progressFilled = controls.querySelector('.progress-filled');
  const volumeSlider = controls.querySelector('.volume-slider');
  const currentTimeSpan = controls.querySelector('.current-time');
  const durationSpan = controls.querySelector('.duration');

  var videoControlsTimeout;

  // Mouse movement handling with cleanup
  function handleMouseMove() {
    controls.style.opacity = '1';
    clearTimeout(videoControlsTimeout);
    videoControlsTimeout = setTimeout(function () {
      if (!video.paused) {
        controls.style.opacity = '0';
      }
    }, 3000);
  }

  function handleMouseLeave() {
    if (!video.paused) {
      controls.style.opacity = '0';
    }
  }

  videoEventRegistry.add(wrapper, 'mousemove', handleMouseMove);
  videoEventRegistry.add(wrapper, 'mouseleave', handleMouseLeave);

  // Play/Pause functionality
  function handlePlayPause() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function handlePlay() {
    playPauseBtn.querySelector('i').className = 'fas fa-pause';
  }

  function handlePause() {
    playPauseBtn.querySelector('i').className = 'fas fa-play';
    controls.style.opacity = '1';
  }

  videoEventRegistry.add(playPauseBtn, 'click', handlePlayPause);
  videoEventRegistry.add(video, 'play', handlePlay);
  videoEventRegistry.add(video, 'pause', handlePause);

  // Mute functionality
  function updateMuteButton() {
    const icon = muteBtn.querySelector('i');
    if (video.muted || video.volume === 0) {
      icon.className = 'fas fa-volume-mute';
    } else if (video.volume < 0.5) {
      icon.className = 'fas fa-volume-down';
    } else {
      icon.className = 'fas fa-volume-up';
    }
  }

  function handleMute() {
    video.muted = !video.muted;
    updateMuteButton();
  }

  videoEventRegistry.add(muteBtn, 'click', handleMute);

  // Volume control
  function handleVolumeChange() {
    video.volume = this.value;
    video.muted = false;
    updateMuteButton();
  }

  videoEventRegistry.add(volumeSlider, 'input', handleVolumeChange);

  // Progress bar functionality
  function handleTimeUpdate() {
    const percent = (video.currentTime / video.duration) * 100;
    progressFilled.style.width = percent + '%';
    currentTimeSpan.textContent = formatTime(video.currentTime);
  }

  function handleLoadedMetadata() {
    durationSpan.textContent = formatTime(video.duration);
  }

  function handleProgressClick(e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  }

  videoEventRegistry.add(video, 'timeupdate', handleTimeUpdate);
  videoEventRegistry.add(video, 'loadedmetadata', handleLoadedMetadata);
  videoEventRegistry.add(progressBar, 'click', handleProgressClick);

  // Fullscreen functionality
  function handleFullscreen() {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  }

  videoEventRegistry.add(fullscreenBtn, 'click', handleFullscreen);

  // Context menu prevention
  function handleContextMenu(e) {
    e.preventDefault();
  }

  videoEventRegistry.add(video, 'contextmenu', handleContextMenu);
}


// Setup event listeners for self-hosted videos
function setupVideoEventListeners(video) {
  function handleLoadStart() {
    console.log('Video loading started');
  }

  function handleLoadedMetadata() {
    console.log('Video metadata loaded');
    hideLoading();
  }

  function handleCanPlay() {
    console.log('Video can start playing');
    hideLoading();
  }

  function handleError(e) {
    console.error('Video error:', e);
    const errorMsg = `
      <div class="alert alert-warning" role="alert">
        <h5><i class="fas fa-exclamation-triangle"></i> Video Loading Issue</h5>
        <p>There was a problem loading this video. You can try:</p>
        <ul>
          <li><a href="${video.src}" target="_blank">Opening the video directly</a></li>
          <li>Refreshing the page</li>
          <li>Checking your internet connection</li>
        </ul>
      </div>
    `;
    video.parentElement.innerHTML = errorMsg;
  }

  function handleKeydown(e) {
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        break;
      case 'KeyM':
        e.preventDefault();
        video.muted = !video.muted;
        break;
      case 'KeyF':
        e.preventDefault();
        if (video.requestFullscreen) {
          video.requestFullscreen();
        }
        break;
    }
  }

  // Register all event listeners
  videoEventRegistry.add(video, 'loadstart', handleLoadStart);
  videoEventRegistry.add(video, 'loadedmetadata', handleLoadedMetadata);
  videoEventRegistry.add(video, 'canplay', handleCanPlay);
  videoEventRegistry.add(video, 'error', handleError);
  videoEventRegistry.add(video, 'keydown', handleKeydown);
}

// ============================================================================
// PAGE CLEANUP SYSTEM
// ============================================================================

// Cleanup when page is about to unload
function setupPageCleanup() {
  function handleBeforeUnload() {
    videoEventRegistry.cleanup();
  }

  function handlePageHide() {
    videoEventRegistry.cleanup();
  }

  // Handle page navigation/refresh
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('pagehide', handlePageHide);

  // Handle browser back button (for single-page app behavior)
  window.addEventListener('popstate', handleBeforeUnload);
}

// Initialize cleanup system when page loads
document.addEventListener('DOMContentLoaded', function () {
  setupPageCleanup();
});

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const container = document.getElementById("projectDetail");

if (container) {
  fetch("data/projects.json")
    .then(function (res) { return res.json(); })
    .then(function (projects) {
      // Get and sanitize the project ID
      const rawId = new URLSearchParams(window.location.search).get("id");
      const id = sanitizeProjectId(rawId);

      // Validate ID
      if (!id) {
        container.innerHTML = "<p class='text-danger'>Invalid or missing project ID.</p>";
        return;
      }

      const project = projects.find(function (p) { return p.id === id; });

      if (!project) {
        container.innerHTML = "<p class='text-danger'>Project not found.</p>";
        return;
      }

      // Show loading state initially
      container.innerHTML = `
        <div class="video-loading">
          <i class="fas fa-spinner"></i>
          Loading video...
        </div>
      `;

      // Determine if this is a self-hosted video or embedded content
      const isLocalVideo = project.videoUrl.startsWith('/') ||
        project.videoUrl.startsWith('./') ||
        project.videoUrl.includes('.mp4') ||
        project.videoUrl.includes('.webm') ||
        project.videoUrl.includes('.ogg');

      var media;
      var videoAttributes = '';

      if (isLocalVideo) {
        // Self-hosted video configuration
        videoAttributes = 'preload="metadata" playsinline disablepictureinpicture controlslist="nodownload"';
        const posterImage = project.thumbnail || generatePosterPath(project.videoUrl);

        media = `
          <div class="video-wrapper">
            <video ${videoAttributes} poster="${posterImage}" onloadedmetadata="hideLoading()">
              <source src="${project.videoUrl}" type="video/mp4">
              <p>Your browser doesn't support HTML5 video. Please upgrade to a modern browser to view this content.</p>
            </video>
            <div class="custom-video-controls">
              <div class="controls-bar">
                <button class="control-btn play-pause-btn" title="Play/Pause">
                  <i class="fas fa-play"></i>
                </button>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-filled"></div>
                  </div>
                  <div class="time-display">
                    <span class="current-time">0:00</span> / <span class="duration">0:00</span>
                  </div>
                </div>
                <button class="control-btn mute-btn" title="Mute/Unmute">
                  <i class="fas fa-volume-up"></i>
                </button>
                <div class="volume-container">
                  <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="1">
                </div>
                <button class="control-btn fullscreen-btn" title="Fullscreen">
                  <i class="fas fa-expand"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        // Embedded video (YouTube, Vimeo, etc.)
        media = `
          <div class="video-wrapper">
            <div class="ratio">
              <iframe src="${project.videoUrl}"
                  title="${project.title}"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  onload="hideLoading()">
              </iframe>
            </div>
          </div>
        `;
      }

      // Build the complete video detail page
      setTimeout(function () {
        container.innerHTML = `
          <div class="back-nav">
            <a href="video.html" class="mt-3 btn btn-outline-warning">
              <i class="fas fa-arrow-left"></i> Back to Videos
           </a>
          </div>
          <div class="video-detail-container">
            ${media}
            
            <div class="video-info">
              <h2>${project.title}</h2>
              ${project.description ? `<div class="description">${project.description}</div>` : ''}
              <div class="video-meta">
                <div class="meta-item">
                  <span class="meta-label">Client</span>
                  <span class="meta-value">${project.client || 'Personal Project'}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Date</span>
                  <span class="meta-value">${project.mdyDate || project.date}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Location</span>
                  <span class="meta-value">${getVideoType(project.videoUrl)}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Tools Used</span>
                  <span class="meta-value">${project.tools || 'Tool Not Listed'}</span>
                </div>
              </div>
            </div>
          </div>
        `;

        // Add video event listeners for self-hosted videos
        if (isLocalVideo) {
          const videoElement = container.querySelector('video');
          if (videoElement) {
            setupVideoEventListeners(videoElement);
            setupPlayButtonOverlay(videoElement);
            setupCustomControls(videoElement);
          }
        }
      }, 500);
    })
    .catch(function (err) {
      console.error("Failed to load project detail:", err);
      container.innerHTML = "<p class='text-danger'>Error loading project details.</p>";
    });
}

// Handle responsive video sizing on window resize
var windowResizeTimeout;
window.addEventListener('resize', function () {
  clearTimeout(windowResizeTimeout);
  windowResizeTimeout = setTimeout(function () {
    console.log('Window resized - video containers adjusted');
  }, 250);
});

// Initialize any special mobile video handling
document.addEventListener('DOMContentLoaded', function () {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    console.log('Mobile device detected - adjusting video settings');
    document.body.classList.add('mobile-device');
  }
});