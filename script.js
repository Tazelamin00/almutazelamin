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

      transitionLayer.classList.remove('is_closing');
      transitionLayer.classList.add('is_active');

      if (transitionAudio) {
        transitionAudio.pause();
        transitionAudio.currentTime = 0;
      }

      if (selectedAudio) {
        transitionAudio = new Audio(selectedAudio);
        transitionAudio.currentTime = 0;
        transitionAudio.muted = false;
        transitionAudio.play().catch(function () {});
      }

      if (transitionVideo) {
        if (selectedVideo) {
          transitionVideo.src = selectedVideo;
          transitionVideo.load();
        }

        transitionVideo.currentTime = 0;
        transitionVideo.muted = Boolean(selectedAudio);

        const fallbackTimer = setTimeout(function () {
          if (transitionAudio) {
            transitionAudio.pause();
            transitionAudio.currentTime = 0;
          }
          goToTargetPage();
        }, 5000);

        transitionVideo.onended = function () {
          clearTimeout(fallbackTimer);
          if (transitionAudio) {
            transitionAudio.pause();
            transitionAudio.currentTime = 0;
          }
          goToTargetPage();
        };

        transitionVideo.play().catch(function () {
          clearTimeout(fallbackTimer);
          if (transitionAudio) {
            transitionAudio.pause();
            transitionAudio.currentTime = 0;
          }
          goToTargetPage();
        });

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

if (pageHeader && menuButton) {
  const pageBody = document.body;
  let isNavigatingToMenu = false;

  menuButton.addEventListener('click', function () {
    if (isNavigatingToMenu) {
      return;
    }

    isNavigatingToMenu = true;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Opening navigation');
    pageBody.classList.add('menu_navigating');

    setTimeout(function () {
      window.location.href = 'menu.html';
    }, 350);
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
