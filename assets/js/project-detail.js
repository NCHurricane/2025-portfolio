// Video project-detail functionality


(function () {
  'use strict';


  function sanitizeProjectId(id) {
    if (!id) return null;
    var sanitized = id.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (sanitized.length > 50) {
      sanitized = sanitized.substring(0, 50);
    }
    return sanitized.length > 0 ? sanitized : null;
  }

  function hideLoading() {
    var loadingElement = document.querySelector('.video-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  function generatePosterPath(videoUrl) {
    var videoName = videoUrl.split('/').pop().replace(/\.(mp4|webm|ogg)$/i, '');
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

  function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  var videoEventRegistry = {
    listeners: [],

    add: function (element, event, handler, options) {
      element.addEventListener(event, handler, options);
      this.listeners.push({
        element: element,
        event: event,
        handler: handler,
        options: options
      });
    },

    cleanup: function () {
      this.listeners.forEach(function (listener) {
        try {
          if (listener.element) {
            if (listener.element.isConnected !== false) {
              listener.element.removeEventListener(listener.event, listener.handler, listener.options);
            } else {
              listener.element.removeEventListener(listener.event, listener.handler, listener.options);
            }
          }
        } catch (error) {
          console.warn('Event listener cleanup warning (non-critical):', error.message);
        }
      });

      this.listeners.length = 0;
      console.log('Video event listeners cleaned up');
    },
  };

  function setupPlayButtonOverlay(video) {
    var wrapper = video.closest('.video-wrapper');

    var playOverlay = document.createElement('div');
    playOverlay.className = 'video-play-overlay';
    playOverlay.innerHTML = `
            <div class="play-button">
                <i class="fas fa-play"></i>
            </div>
        `;

    wrapper.appendChild(playOverlay);

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

  function setupCustomControls(video) {
    var wrapper = video.closest('.video-wrapper');
    if (!wrapper) {
      console.warn('Video wrapper not found, skipping custom controls');
      return;
    }
    var controls = wrapper.querySelector('.custom-video-controls');
    var playPauseBtn = controls.querySelector('.play-pause-btn');
    var muteBtn = controls.querySelector('.mute-btn');
    var fullscreenBtn = controls.querySelector('.fullscreen-btn');
    var progressBar = controls.querySelector('.progress-bar');
    var progressFilled = controls.querySelector('.progress-filled');
    var volumeSlider = controls.querySelector('.volume-slider');
    var currentTimeSpan = controls.querySelector('.current-time');
    var durationSpan = controls.querySelector('.duration');

    var videoControlsTimeout;

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

    function updateMuteButton() {
      var icon = muteBtn.querySelector('i');
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

    function handleVolumeChange() {
      video.volume = this.value;
      video.muted = false;
      updateMuteButton();
    }

    videoEventRegistry.add(volumeSlider, 'input', handleVolumeChange);

    function handleTimeUpdate() {
      var percent = (video.currentTime / video.duration) * 100;
      progressFilled.style.width = percent + '%';
      currentTimeSpan.textContent = formatTime(video.currentTime);
    }

    function handleLoadedMetadata() {
      durationSpan.textContent = formatTime(video.duration);
    }

    function handleProgressClick(e) {
      var rect = progressBar.getBoundingClientRect();
      var percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * video.duration;
    }

    videoEventRegistry.add(video, 'timeupdate', handleTimeUpdate);
    videoEventRegistry.add(video, 'loadedmetadata', handleLoadedMetadata);
    videoEventRegistry.add(progressBar, 'click', handleProgressClick);

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

    function handleContextMenu(e) {
      e.preventDefault();
    }

    videoEventRegistry.add(video, 'contextmenu', handleContextMenu);
  }

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
      var errorMsg = `
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

    videoEventRegistry.add(video, 'loadstart', handleLoadStart);
    videoEventRegistry.add(video, 'loadedmetadata', handleLoadedMetadata);
    videoEventRegistry.add(video, 'canplay', handleCanPlay);
    videoEventRegistry.add(video, 'error', handleError);
    videoEventRegistry.add(video, 'keydown', handleKeydown);
  }


  function setupPageCleanup() {
    function handleBeforeUnload() {
      videoEventRegistry.cleanup();

      // Add lightbox cleanup
      if (window.ChuckPortfolio && window.ChuckPortfolio.lightbox) {
        window.ChuckPortfolio.lightbox.cleanup();
      }

      // Additional cleanup for any remaining video elements
      var remainingVideos = document.querySelectorAll('video');
      remainingVideos.forEach(function (video) {
        video.pause();
        video.src = '';
        video.load();
      });

      // Clear any remaining timeouts/intervals
      var highestTimeoutId = setTimeout(function () { }, 0);
      for (var i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }
    }

    function handlePageHide() {
      videoEventRegistry.cleanup();

      // Add lightbox cleanup
      if (window.ChuckPortfolio && window.ChuckPortfolio.lightbox) {
        window.ChuckPortfolio.lightbox.cleanup();
      }
    }

    // More aggressive cleanup triggers
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('popstate', handleBeforeUnload);
    window.addEventListener('hashchange', handleBeforeUnload);
  }



  var container = document.getElementById("projectDetail");

  if (container) {
    fetch("data/projects.json")
      .then(function (res) { return res.json(); })
      .then(function (projects) {
        var rawId = new URLSearchParams(window.location.search).get("id");
        var id = sanitizeProjectId(rawId);

        if (!id) {
          container.innerHTML = "<p class='text-danger'>Invalid or missing project ID.</p>";
          return;
        }

        var project = projects.find(function (p) { return p.id === id; });

        if (!project) {
          container.innerHTML = "<p class='text-danger'>Project not found.</p>";
          return;
        }

        container.innerHTML = `
                    <div class="video-loading">
                        <i class="fas fa-spinner"></i>
                        Loading video...
                    </div>
                `;

        var isLocalVideo = project.videoUrl.startsWith('/') ||
          project.videoUrl.startsWith('./') ||
          project.videoUrl.includes('.mp4') ||
          project.videoUrl.includes('.webm') ||
          project.videoUrl.includes('.ogg');

        var media;
        var videoAttributes = '';

        if (isLocalVideo) {
          videoAttributes = 'preload="metadata" playsinline disablepictureinpicture controlslist="nodownload"';
          var posterImage = project.thumbnail || generatePosterPath(project.videoUrl);

          media = `
                        <div class="video-wrapper">
                            <video ${videoAttributes} poster="${posterImage}">
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
          media = `
                        <div class="video-wrapper">
                            <div class="ratio">
                                <iframe src="${project.videoUrl}"
                                    title="${project.title}"
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowfullscreen">
                                </iframe>
                            </div>
                        </div>
                    `;
        }

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

          var iframe = container.querySelector('iframe');
          if (iframe) {
            iframe.addEventListener('load', hideLoading);
          }

          var video = container.querySelector('video');
          if (video) {
            video.addEventListener('loadedmetadata', hideLoading);

            if (isLocalVideo) {
              setupVideoEventListeners(video);
              setupPlayButtonOverlay(video);
              setupCustomControls(video);
            }
          }
        }, 500);
      })
      .catch(function (err) {
        console.error("Failed to load project detail:", err);
        container.innerHTML = "<p class='text-danger'>Error loading project details.</p>";
      });
  }

  var windowResizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(windowResizeTimeout);
    windowResizeTimeout = setTimeout(function () {
      console.log('Window resized - video containers adjusted');
    }, 250);
  });

  setupPageCleanup();

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    console.log('Mobile device detected - adjusting video settings');
    document.body.classList.add('mobile-device');
  }


  window.ChuckPortfolio = window.ChuckPortfolio || {};

  window.ChuckPortfolio.projectDetail = {
    cleanup: function () {
      videoEventRegistry.cleanup();
    },

    version: '1.0.0'
  };

})();