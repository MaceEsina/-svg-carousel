(function() {
  'use strict';

  var DELAY = 400;

  var body = document.body;
  var setFullScreen = body.requestFullScreen || body.webkitRequestFullScreen
    || body.mozRequestFullScreen || body.msRequestFullScreen;
  var exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen
    || document.mozCancelFullScreen || document.msExitFullscreen;

  var allButton = document.getElementById('all');
  var nextButton = document.getElementById('next');
  var prevButton = document.getElementById('prev');
  var backButton = document.getElementById('back');
  var zoomButton = document.getElementById('zoom');
  var switchButton = document.getElementById('switch');
  var fullScreenButton = document.getElementById('full');

  var contentsPage = document.getElementById('contents');
  var pages = document.getElementsByClassName('page');
  var rects = document.getElementsByClassName('rect');
  var selectPages = document.getElementsByClassName('select-page');
  var viewBoxes = [].map.call(pages, function(page) {
    return page.getAttribute('viewBox');
  });

  var isPageMode = false;
  var isFullScreen = false;
  var isContentVisible = false;
  var isZoomOn = false;

  var pageIndex = 0;
  var areaIndex = 0;
  var areas = getAreas(pages[1]);
  var activePage = pages[pageIndex];
  var activeRect, x1 = null, y1 = null, i;

  nextButton.addEventListener('click', throttle(next));
  prevButton.addEventListener('click', throttle(prev));
  switchButton.addEventListener('click', switchMode);
  allButton.addEventListener('click', showContentsPage);
  backButton.addEventListener('click', hideContentsPage);
  zoomButton.addEventListener('click', toggleZoom);
  fullScreenButton.addEventListener('click', toggleFullScreen);

  document.addEventListener('touchstart', throttle(handleTouchStart), false);
  document.addEventListener('touchmove', throttle(handleTouchMove), false);

  for (i = 0; i < selectPages.length; i++) {
    selectPages[i].addEventListener('click', selectPage.bind(null, i));
  }

  function throttle(func) {
    var inThrottle;

    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true
        setTimeout(function() {
          inThrottle = false;
        }, DELAY);
      }
    }
  }

  function handleTouchStart(evt) {
    x1 = evt.touches[0].clientX;
    y1 = evt.touches[0].clientY;
  };

  function handleTouchMove(evt) {
    if (isContentVisible || x1 === null || y1 === null) {
      return;
    }

    var x2 = evt.touches[0].clientX;
    var y2 = evt.touches[0].clientY;
    var xDiff = x1 - x2;
    var yDiff = y1 - y2;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      xDiff < 0 ? prev() : next();
    }

    x1 = null;
    y1 = null;
};

  function selectPage(index) {
    pages[pageIndex].classList.remove('active');
    pageIndex = index;
    body.classList.add('fade');
    hideContentsPage();
    changePage(true);

    if (!isPageMode) {
      changeArea();
    }

    updateNavButton();
    setTimeout(function() {
      body.classList.remove('fade');
    }, DELAY);
  }

  function next() {
    if (isLastPage()) {
      return;
    }

    if (isPageMode) {
      changePage(true);
    } else {
      nextArea();
    }

    updateNavButton();
  }

  function prev() {
    if (isFirstPage()) {
      return;
    }

    if (isPageMode) {
      changePage(false);
    } else {
      prevArea();
    }

    updateNavButton();
  }

  function fade() {
    activePage = pages[pageIndex];
    activePage.classList.add('fade');
  }

  function nextArea() {
    if (isFirstPage() || areaIndex >= areas.length - 1) {
      changePage(true);
      changeArea();
    } else {
      fade();
      areaIndex++;
      setTimeout(changeArea, DELAY);
    }
  }

  function prevArea() {
    if (isLastPage() || areaIndex <= 0) {
      changePage(false);
      changeArea();
    } else {
      fade();
      areaIndex--;
      setTimeout(changeArea, DELAY);
    }
  }

  function changeArea() {
    if (isFirstPage() || isLastPage()) {
      return;
    }

    var activeArea = areas[areaIndex];
    var points = activeArea.getAttribute('points').split(' ');
    var xy1 = points[0].split(',');
    var xy2 = points[1].split(',');
    var xy3 = points[2].split(',');
    var box = [xy1[0], xy1[1], xy2[0] - xy1[0], xy3[1] - xy2[1]];

    activePage.classList.remove('fade');
    activePage.setAttribute('viewBox', box.join(' '));
    activeRect = rects[pageIndex - 1];
    activeRect.setAttribute('x', xy1[0]);
    activeRect.setAttribute('y', xy1[1]);
  }

  function changePage(isNext) {
    pages[pageIndex].classList.remove('active');
    pageIndex = pageIndex + (isNext ? 1 : -1);
    activePage = pages[pageIndex];
    activePage.classList.add('active');
    areas = getAreas(activePage);
    areaIndex = isNext ? 0 : areas.length - 1;
  }

  function updateNavButton() {
    if (isLastPage()) {
      nextButton.classList.add('hidden');
    } else {
      nextButton.classList.remove('hidden');
    }

    if (isFirstPage()) {
      prevButton.classList.add('hidden');
    } else {
      prevButton.classList.remove('hidden');
    }
  }

  function switchMode(evt) {
    isPageMode = !isPageMode;
    evt.currentTarget.classList[isPageMode ? 'add' : 'remove']('active');

    if (isFirstPage() || isLastPage()) {
      return;
    }

    if (isPageMode) {
      restoreViewBox();
      zoomButton.disabled = false;
    } else {
      areaIndex = 0;
      zoomButton.disabled = true;
      changeArea();
    }
  }

  function restoreViewBox() {
    for (i = 1; i < pages.length - 1; i++) {
      pages[i].setAttribute('viewBox', viewBoxes[i]);
      activeRect = rects[i - 1];
      activeRect.setAttribute('x', 0);
      activeRect.setAttribute('y', 0);
    }
  }

  function getAreas(elem) {
    return elem.getElementsByTagName('polygon');
  }

  function isFirstPage() {
    return pageIndex <= 0;
  }

  function isLastPage() {
    return pageIndex >= pages.length - 1;
  }

  function showContentsPage() {
    if (!isFirstPage() && !isLastPage()) {
      selectPages[pageIndex - 1].classList.add('active');
    }

    isContentVisible = true;
    contentsPage.classList.add('active');
  }

  function hideContentsPage() {
    setTimeout(function() {
      for (i = 0; i < selectPages.length; i++) {
        selectPages[i].classList.remove('active');
      }
    }, DELAY);

    isContentVisible = false;
    contentsPage.classList.remove('active');
  }

  function toggleFullScreen() {
    isFullScreen = !isFullScreen;

    isFullScreen && setFullScreen && setFullScreen.call(body);
    !isFullScreen && exitFullscreen && exitFullscreen.call(document);

    isFullScreen && fullScreenButton.classList.add('active');
    !isFullScreen && fullScreenButton.classList.remove('active');
  }

  function toggleZoom() {
    isZoomOn = !isZoomOn;

    if (isZoomOn) {
      zoomButton.classList.add('active');
    } else {
      zoomButton.classList.remove('active');
    }
  }
})();
