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
      const selectedAudio = this.getAttribute('data-transition-audio');
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

      if (selectedAudio) {
        transitionAudio = new Audio(selectedAudio);
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
        transitionVideo.muted = Boolean(selectedAudio);

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

// Work page slideshow (cycles every 2 seconds using all images in img/components)
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

  const navigateMenuWithExitSlide = function (targetUrl) {
    if (isMenuExiting) {
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
}
