// Helper function to hide loading state
function hideLoading() {
  const loadingElement = document.querySelector('.video-loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

// Helper function to generate poster image path from video URL
function generatePosterPath(videoUrl) {
  // Extract filename without extension and create poster path
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

// Setup custom play button overlay for better UX
function setupPlayButtonOverlay(video) {
  const wrapper = video.closest('.video-wrapper');

  // Create custom play button overlay
  const playOverlay = document.createElement('div');
  playOverlay.className = 'video-play-overlay';
  playOverlay.innerHTML = `
    <div class="play-button">
      <i class="fas fa-play"></i>
    </div>
  `;

  wrapper.appendChild(playOverlay);

  // Hide overlay when video starts playing
  video.addEventListener('play', function () {
    playOverlay.style.opacity = '0';
    playOverlay.style.pointerEvents = 'none';
  });

  // Show overlay when video is paused/ended
  video.addEventListener('pause', function () {
    if (!video.ended) {
      playOverlay.style.opacity = '1';
      playOverlay.style.pointerEvents = 'auto';
    }
  });

  video.addEventListener('ended', function () {
    playOverlay.style.opacity = '1';
    playOverlay.style.pointerEvents = 'auto';
    playOverlay.querySelector('i').className = 'fas fa-redo';
  });

  // Play video when overlay is clicked
  playOverlay.addEventListener('click', function () {
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

  let videoControlsTimeout;

  // Show/hide controls on mouse movement
  wrapper.addEventListener('mousemove', function () {
    controls.style.opacity = '1';
    clearTimeout(videoControlsTimeout);
    videoControlsTimeout = setTimeout(() => {
      if (!video.paused) {
        controls.style.opacity = '0';
      }
    }, 3000);
  });

  wrapper.addEventListener('mouseleave', function () {
    if (!video.paused) {
      controls.style.opacity = '0';
    }
  });

  // Play/Pause functionality
  playPauseBtn.addEventListener('click', function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    playPauseBtn.querySelector('i').className = 'fas fa-pause';
  });

  video.addEventListener('pause', function () {
    playPauseBtn.querySelector('i').className = 'fas fa-play';
    controls.style.opacity = '1';
  });

  // Mute functionality
  muteBtn.addEventListener('click', function () {
    video.muted = !video.muted;
    updateMuteButton();
  });

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

  // Volume control
  volumeSlider.addEventListener('input', function () {
    video.volume = this.value;
    video.muted = false;
    updateMuteButton();
  });

  // Progress bar functionality
  video.addEventListener('timeupdate', function () {
    const percent = (video.currentTime / video.duration) * 100;
    progressFilled.style.width = percent + '%';

    currentTimeSpan.textContent = formatTime(video.currentTime);
  });

  video.addEventListener('loadedmetadata', function () {
    durationSpan.textContent = formatTime(video.duration);
  });

  progressBar.addEventListener('click', function (e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  });

  // Fullscreen functionality
  fullscreenBtn.addEventListener('click', function () {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  });

  // Format time helper
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Prevent right-click context menu on video
  video.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
}

// Setup event listeners for self-hosted videos
function setupVideoEventListeners(video) {
  // Handle video loading states
  video.addEventListener('loadstart', function () {
    console.log('Video loading started');
  });

  video.addEventListener('loadedmetadata', function () {
    console.log('Video metadata loaded');
    hideLoading();
  });

  video.addEventListener('canplay', function () {
    console.log('Video can start playing');
    hideLoading();
  });

  video.addEventListener('error', function (e) {
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
  });

  // Keyboard controls for accessibility
  video.addEventListener('keydown', function (e) {
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
  });
}

const container = document.getElementById("projectDetail");

if (container) {
  fetch("data/projects.json")
    .then(res => res.json())
    .then(projects => {
      const id = new URLSearchParams(window.location.search).get("id");
      const project = projects.find(p => p.id === id);

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

      let media;
      let videoAttributes = '';

      if (isLocalVideo) {
        // Self-hosted video configuration - custom controls to prevent downloads
        videoAttributes = 'preload="metadata" playsinline disablepictureinpicture controlslist="nodownload"';

        // Generate poster image path if not provided
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
      setTimeout(() => {
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
    .catch(err => {
      console.error("Failed to load project detail:", err);
      container.innerHTML = "<p class='text-danger'>Error loading project details.</p>";
    });
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
  // Extract filename without extension and create poster path
  const videoName = videoUrl.split('/').pop().replace(/\.(mp4|webm|ogg)$/i, '');
  return `assets/video/gallery/thumbs/${videoName}.webp`;
}
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

// Setup event listeners for self-hosted videos
function setupVideoEventListeners(video) {
  // Handle video loading states
  video.addEventListener('loadstart', function () {
    console.log('Video loading started');
  });

  video.addEventListener('loadedmetadata', function () {
    console.log('Video metadata loaded');
    hideLoading();
  });

  video.addEventListener('canplay', function () {
    console.log('Video can start playing');
    hideLoading();
  });

  video.addEventListener('error', function (e) {
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
  });

  // Keyboard controls for accessibility
  video.addEventListener('keydown', function (e) {
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
  });
}

// Handle responsive video sizing on window resize
let windowResizeTimeout;
window.addEventListener('resize', function () {
  clearTimeout(windowResizeTimeout);
  windowResizeTimeout = setTimeout(function () {
    // Re-evaluate video container sizing if needed
    console.log('Window resized - video containers adjusted');
  }, 250);
});

// Initialize any special mobile video handling
document.addEventListener('DOMContentLoaded', function () {
  // Check if this is a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    console.log('Mobile device detected - adjusting video settings');
    document.body.classList.add('mobile-device');
  }
});