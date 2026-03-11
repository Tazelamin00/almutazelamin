// ─── Site Loader ──────────────────────────────────────────────
(function () {
    var loader    = document.getElementById('site_loader');
    if (!loader) return;

  var LOADER_SEEN_KEY = 'almutaz_loader_seen';
  var hasSeenLoader = false;

  try {
    hasSeenLoader = localStorage.getItem(LOADER_SEEN_KEY) === '1';
  } catch (e) {}

  if (hasSeenLoader) {
    loader.remove();
    return;
  }

  try {
    localStorage.setItem(LOADER_SEEN_KEY, '1');
  } catch (e) {}

    var pctLabel = document.getElementById('loader_pct_label');

    var current = 0;

    function tick() {
        if (current >= 100) {
            pctLabel.textContent = '100';
            setTimeout(function () {
                loader.classList.add('is_done');
                loader.addEventListener('transitionend', function () {
                    loader.remove();
                }, { once: true });
            }, 350);
            return;
        }

        var inc;
        if      (current < 15) { inc = Math.random() * 2.8 + 1.0; }
        else if (current < 65) { inc = Math.random() * 1.2 + 0.3; }
        else if (current < 88) { inc = Math.random() * 2.0 + 0.7; }
        else                   { inc = Math.random() * 3.0 + 1.2; }

        current = Math.min(current + inc, 100);
        var display = String(Math.floor(current)).padStart(2, '0');

        pctLabel.textContent = display;

        var delay;
        if      (current < 15) { delay = 55;  }
        else if (current < 65) { delay = 115; }
        else if (current < 88) { delay = 55;  }
        else                   { delay = 38;  }

        setTimeout(tick, delay);
    }

    setTimeout(tick, 180);
})();
// ──────────────────────────────────────────────────────────────

// Shared navigation transition (index page)
const navTransitionLinks = document.querySelectorAll('.nav_transition_link');
const transitionLayer = document.getElementById('pageTransition');
const transitionVideo = document.getElementById('transitionVideo');
let transitionAudio = null;

if (navTransitionLinks.length > 0 && transitionLayer) {
  navTransitionLinks.forEach(function (transitionLink) {
    transitionLink.addEventListener('click', function (event) {
      event.preventDefault();

      const targetPage = this.getAttribute('href');
      const selectedVideo = this.getAttribute('data-transition-video');
      const selectedMedia = this.getAttribute('data-transition-media') || this.getAttribute('data-transition-audio');
      let hasNavigated = false;

      const goToTargetPage = function () {
        if (hasNavigated) {
          return;
        }

        hasNavigated = true;
        window.location.href = targetPage;
      };

      const stopTransitionMedia = function () {
        if (transitionAudio) {
          transitionAudio.pause();
          transitionAudio.currentTime = 0;
        }

        if (transitionVideo) {
          transitionVideo.pause();
          transitionVideo.loop = false;
          transitionVideo.onended = null;
        }
      };

      const finishTransition = function () {
        stopTransitionMedia();
        goToTargetPage();
      };

      transitionLayer.classList.remove('is_closing');
      transitionLayer.classList.add('is_active');

      stopTransitionMedia();

      if (selectedMedia) {
        transitionAudio = new Audio(selectedMedia);
        transitionAudio.currentTime = 0;
        transitionAudio.muted = false;
        transitionAudio.play().catch(function () {});
      } else {
        transitionAudio = null;
      }

      if (transitionVideo) {
        if (selectedVideo) {
          transitionVideo.src = selectedVideo;
          transitionVideo.load();
        }

        transitionVideo.loop = Boolean(transitionAudio);
        transitionVideo.muted = Boolean(selectedMedia);

        const fallbackTimer = setTimeout(function () {
          finishTransition();
        }, transitionAudio ? 20000 : 7000);

        if (transitionAudio) {
          transitionAudio.onended = function () {
            clearTimeout(fallbackTimer);
            finishTransition();
          };
          transitionVideo.onended = null;
        } else {
          transitionVideo.onended = function () {
            clearTimeout(fallbackTimer);
            finishTransition();
          };
        }

        const playTransitionFromRandomStart = function () {
          const duration = transitionVideo.duration;

          if (Number.isFinite(duration) && duration > 0.35) {
            const randomStartTime = Math.random() * (duration - 0.25);
            transitionVideo.currentTime = randomStartTime;
          } else {
            transitionVideo.currentTime = 0;
          }

          transitionVideo.play().catch(function () {
            if (!transitionAudio) {
              clearTimeout(fallbackTimer);
              finishTransition();
            }
          });
        };

        if (transitionVideo.readyState >= 1) {
          playTransitionFromRandomStart();
        } else {
          transitionVideo.addEventListener('loadedmetadata', playTransitionFromRandomStart, { once: true });
        }

        return;
      }

      setTimeout(function () {
        goToTargetPage();
      }, 1000);
    });
  });
}

// Work page slideshow (cycles every 2 seconds using the original component images)
const workSlideshowImage = document.querySelector('.work_page .work_center_context .personal_picture');

if (workSlideshowImage) {
  const slideshowImages = [
    'img/components/Property 1=Default.png',
    'img/components/Property 1=Variant2.png',
    'img/components/Property 1=Variant3.png',
    'img/components/Property 1=Variant4.png',
    'img/components/Property 1=Variant5.png',
    'img/components/Property 1=Variant6.png',
  ];

  let imageIndex = slideshowImages.indexOf(workSlideshowImage.getAttribute('src') || '');
  if (imageIndex === -1) {
    imageIndex = 0;
    workSlideshowImage.src = slideshowImages[0];
  }

  setInterval(function () {
    imageIndex = (imageIndex + 1) % slideshowImages.length;
    workSlideshowImage.src = slideshowImages[imageIndex];
  }, 2000);
}

// Work page marquee speed (slower and responsive)
const workMarquee = document.querySelector('.work_page .work_marquee');

if (workMarquee) {
  const updateWorkMarqueeSpeed = function () {
    workMarquee.scrollAmount = window.innerWidth <= 768 ? 2 : 3;
  };

  updateWorkMarqueeSpeed();
  window.addEventListener('resize', updateWorkMarqueeSpeed);
}

// Home + About page marquee speed (slower on mobile)
const homeAndAboutMarquees = document.querySelectorAll('.home_page marquee, .about_page marquee');

if (homeAndAboutMarquees.length > 0) {
  const updateHomeAndAboutMarqueeSpeed = function () {
    homeAndAboutMarquees.forEach(function (marqueeElement) {
      marqueeElement.scrollAmount = window.innerWidth <= 768 ? 2.75 : 3;
    });
  };

  updateHomeAndAboutMarqueeSpeed();
  window.addEventListener('resize', updateHomeAndAboutMarqueeSpeed);
}

// About + Work menu button opens dedicated navigation page
const pageHeader = document.querySelector('.about_page header, .work_page header');
const menuButton = document.querySelector('.about_page .menu_button, .work_page .menu_button');
const pageSlideDurationMs = 550;

if (pageHeader && menuButton) {
  let isNavigatingToMenu = false;

  menuButton.addEventListener('click', function () {
    if (isNavigatingToMenu) {
      return;
    }

    isNavigatingToMenu = true;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Opening navigation');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `menu.html?from=${encodeURIComponent(currentPage)}`;
  });
}

// Dedicated menu page slide-in
const menuPageBody = document.querySelector('.menu_page.is_entering');
const menuBackgroundVideo = document.querySelector('.menu_page .menu_background_video');

if (menuBackgroundVideo) {
  const menuBody = document.body;

  menuBackgroundVideo.muted = true;
  menuBackgroundVideo.defaultMuted = true;
  menuBackgroundVideo.volume = 0;
  menuBackgroundVideo.loop = true;
  menuBackgroundVideo.playsInline = true;

  menuBackgroundVideo.addEventListener('ended', function () {
    menuBackgroundVideo.currentTime = 0;
    menuBackgroundVideo.play().catch(function () {});
  });

  menuBackgroundVideo.addEventListener('error', function () {
    menuBody.classList.add('menu_video_failed');
  });

  menuBackgroundVideo.addEventListener('canplay', function () {
    menuBody.classList.remove('menu_video_failed');
  });

  const playMenuBackgroundVideo = function () {
    menuBackgroundVideo.play().catch(function () {});
  };

  if (menuBackgroundVideo.readyState >= 2) {
    playMenuBackgroundVideo();
  } else {
    menuBackgroundVideo.addEventListener('loadeddata', playMenuBackgroundVideo, { once: true });
  }
}

if (menuPageBody) {
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      menuPageBody.classList.remove('is_entering');
    });
  });
}

const menuCloseButton = document.querySelector('.menu_page .menu_close_button');
const menuInternalPageLinks = document.querySelectorAll('.menu_page .menu_page_navigation a');

if (menuCloseButton || menuInternalPageLinks.length > 0) {
  const menuBody = document.body;
  let isMenuExiting = false;

  const getTargetPageName = function (targetUrl) {
    try {
      return (new URL(targetUrl, window.location.href).pathname.split('/').pop() || '').toLowerCase();
    } catch (error) {
      return (targetUrl || '').split('#')[0].split('?')[0].split('/').pop().toLowerCase();
    }
  };

  const navigateMenuWithExitSlide = function (targetUrl) {
    if (isMenuExiting) {
      return;
    }

    const targetPageName = getTargetPageName(targetUrl);
    const skipExitTransition = targetPageName === 'about.html' || targetPageName === 'work.html';

    if (skipExitTransition) {
      window.location.href = targetUrl;
      return;
    }

    isMenuExiting = true;
    menuBody.classList.add('is_exiting');

    setTimeout(function () {
      window.location.href = targetUrl;
    }, pageSlideDurationMs);
  };

  if (menuCloseButton) {
    menuCloseButton.addEventListener('click', function (event) {
      event.preventDefault();

      const searchParams = new URLSearchParams(window.location.search);
      const fromPage = searchParams.get('from');
      const allowedPages = ['about.html', 'work.html', 'index.html'];

      if (fromPage && allowedPages.includes(fromPage)) {
        navigateMenuWithExitSlide(fromPage);
        return;
      }

      if (document.referrer && document.referrer.startsWith(window.location.origin)) {
        navigateMenuWithExitSlide(document.referrer);
        return;
      }

      navigateMenuWithExitSlide('index.html');
    });
  }

  menuInternalPageLinks.forEach(function (menuNavigationLink) {
    menuNavigationLink.addEventListener('click', function (event) {
      const targetUrl = (menuNavigationLink.getAttribute('href') || '').trim();

      if (!targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('http') || targetUrl.startsWith('mailto:')) {
        return;
      }

      event.preventDefault();
      navigateMenuWithExitSlide(targetUrl);
    });
  });
}

// Active navigation link (current page)
const allNavigationLinks = document.querySelectorAll('.navigation_links a, .menu_page_navigation a');

if (allNavigationLinks.length > 0) {
  const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const menuFromPage = (searchParams.get('from') || '').toLowerCase();
  const pageForActiveLink = document.body.classList.contains('menu_page') && menuFromPage ? menuFromPage : currentPath;

  allNavigationLinks.forEach(function (navigationLink) {
    const linkHref = (navigationLink.getAttribute('href') || '').trim();

    if (!linkHref || linkHref.startsWith('#') || linkHref.startsWith('http') || linkHref.startsWith('mailto:')) {
      return;
    }

    const normalizedHref = linkHref.split('#')[0].split('?')[0].toLowerCase();

    if (normalizedHref === pageForActiveLink) {
      navigationLink.classList.add('current_page_link');
      return;
    }

    navigationLink.classList.remove('current_page_link');
  });
}

// Site-wide clocks (Chicago)
const cityClockElements = document.querySelectorAll('.city_clock');
const chicagoTimestampElements = document.querySelectorAll('.chicago_timestamp');
const headerClockElements = document.querySelectorAll('.header_clock');

if (cityClockElements.length > 0 || chicagoTimestampElements.length > 0 || headerClockElements.length > 0) {
  const chicagoTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const updateCityClock = function () {
    const chicagoTime = chicagoTimeFormatter.format(new Date());
    cityClockElements.forEach(function (cityClockElement) {
      cityClockElement.textContent = `CHICAGO ${chicagoTime} (CDT)`;
    });

    chicagoTimestampElements.forEach(function (chicagoTimestampElement) {
      chicagoTimestampElement.textContent = `CHICAGO ${chicagoTime} (CDT)`;
    });

    headerClockElements.forEach(function (headerClockElement) {
      headerClockElement.textContent = `CHICAGO ${chicagoTime} (CDT)`;
    });
  };

  updateCityClock();
  setInterval(updateCityClock, 1000);

// ── Work page: scroll progress indicator ─────────────────────
const workScrollPanel = document.querySelector('.work_page .work_center_context');
const workScrollProgressBar = document.querySelector('.work_scroll_progress');

if (workScrollPanel && workScrollProgressBar) {
  const updateWorkScrollProgress = function () {
    const scrollTop = workScrollPanel.scrollTop;
    const scrollHeight = workScrollPanel.scrollHeight - workScrollPanel.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    workScrollProgressBar.style.height = pct + '%';
  };

  workScrollPanel.addEventListener('scroll', updateWorkScrollProgress, { passive: true });
  updateWorkScrollProgress();
}

// ── Work page: project card dot carousel ─────────────────────
const workProjectCards = document.querySelectorAll('.work_page .work_project_card');

workProjectCards.forEach(function (card) {
  const img = card.querySelector('.work_project_img');
  const title = card.querySelector('.work_project_title');
  const year = card.querySelector('.work_project_year');
  const desc = card.querySelector('.work_project_desc');
  const dots = card.querySelectorAll('.work_project_dot');

  if (!img || !dots.length) return;

  const dotsArray = Array.from(dots);
  const autoRotateIntervalMs = 6000;
  const dissolveStepMs = 170;
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoRotateTimer = null;
  let dissolveTimer = null;

  const applyDotContent = function (dot) {
    const src = dot.getAttribute('data-img');
    const dotTitle = dot.getAttribute('data-title');
    const dotYear = dot.getAttribute('data-year');
    const dotDesc = dot.getAttribute('data-desc');

    if (src) img.src = src;
    if (title && dotTitle) title.textContent = dotTitle;
    if (year && dotYear) year.textContent = dotYear;
    if (desc && dotDesc) desc.textContent = dotDesc;
  };

  const applyActiveDotState = function (targetDot) {
    dotsArray.forEach(function (d) {
      d.classList.remove('is_active');
      d.setAttribute('aria-selected', 'false');
    });

    targetDot.classList.add('is_active');
    targetDot.setAttribute('aria-selected', 'true');
    applyDotContent(targetDot);
  };

  const activateDot = function (targetDot, instant) {
    if (!targetDot) return;

    if (dissolveTimer) {
      clearTimeout(dissolveTimer);
      dissolveTimer = null;
    }

    if (instant || prefersReducedMotion) {
      card.classList.remove('is_dissolving');
      applyActiveDotState(targetDot);
      return;
    }

    card.classList.add('is_dissolving');
    dissolveTimer = setTimeout(function () {
      applyActiveDotState(targetDot);
      card.classList.remove('is_dissolving');
      dissolveTimer = null;
    }, dissolveStepMs);
  };

  const activateDotByIndex = function (index) {
    if (!dotsArray.length) return;

    const wrappedIndex = (index + dotsArray.length) % dotsArray.length;
    activateDot(dotsArray[wrappedIndex]);
  };

  const getActiveIndex = function () {
    const activeIndex = dotsArray.findIndex(function (dot) {
      return dot.classList.contains('is_active');
    });

    return activeIndex === -1 ? 0 : activeIndex;
  };

  const startAutoRotate = function () {
    if (autoRotateTimer) {
      clearInterval(autoRotateTimer);
    }

    autoRotateTimer = setInterval(function () {
      activateDotByIndex(getActiveIndex() + 1);
    }, autoRotateIntervalMs);
  };

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      activateDot(dot);
      startAutoRotate();
    });
  });

  const initiallyActiveDot = card.querySelector('.work_project_dot.is_active') || dots[0];
  if (initiallyActiveDot) {
    activateDot(initiallyActiveDot, true);
    startAutoRotate();
  }
});
}
