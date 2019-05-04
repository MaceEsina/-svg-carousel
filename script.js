(function() {
  'use strict';
  var DELAY = 700;

  var nextButton = document.getElementById('next');
  var prevButton = document.getElementById('prev');
  var switchButton = document.getElementById('switch');

  var pages = document.getElementsByClassName('page');
  var rects = document.getElementsByClassName('rect');
  var areas = getAreas(pages[1]);
  var viewBoxes = [].map.call(pages, function(page) {
    return page.getAttribute('viewBox');
  });

  var isPageMode = false;
  var pageIndex = 0;
  var areaIndex = 0;
  var activePage = pages[pageIndex];

  nextButton.addEventListener('click', next);
  prevButton.addEventListener('click', prev);
  switchButton.addEventListener('click', switchMode);

  function next() {
    if (isPageMode) {
      changePage(true);
    } else {
      nextArea();
    }

    updateNavButton(true);
  }

  function prev() {
    if (isPageMode) {
      changePage(false);
    } else {
      prevArea();
    }

    updateNavButton(false);
  }

  function nextArea() {
    if (isFirstPage() || areaIndex >= areas.length - 1) {
      changePage(true);
    } else {
      areaIndex++;
    }

    changeArea();
  }

  function prevArea() {
    if (isLastPage() || areaIndex <= 0) {
      changePage(false);
    } else {
      areaIndex--;
    }

    changeArea();
  }

  function changeArea() {
    if (isFirstPage() || isLastPage()) {
      return;
    }

    var activeArea = areas[areaIndex];
    var activeRect = rects[pageIndex - 1];
    var points = activeArea.getAttribute('points').split(' ');
    var xy1 = points[0].split(',');
    var xy2 = points[1].split(',');
    var xy3 = points[2].split(',');
    var box = [xy1[0], xy1[1], xy2[0] - xy1[0], xy3[1] - xy2[1]];

    pages[pageIndex].setAttribute('viewBox', box.join(' '));
    activeRect.setAttribute('x', xy1[0]);
    activeRect.setAttribute('y', xy1[1]);
  }

  function changePage(isNext) {
    pages[pageIndex].classList.remove('active');
    pageIndex = pageIndex + (isNext ? 1 : -1);
    activePage = pages[pageIndex];
    activePage.classList.add('active');
    areas = getAreas(activePage);
    areaIndex = 0;
  }

  function updateNavButton(isNext) {
    if (isPageMode) {
      var button1 = isNext ? nextButton : prevButton;
      var button2 = !isNext ? nextButton : prevButton;

      button1.disabled = true;
      button2.disabled = false;

      setTimeout(function() {
        button1.disabled = false;
      }, DELAY);
    }

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

  function switchMode() {
    debugger
    isPageMode = !isPageMode;

    if (isPageMode) {
      pages[pageIndex].setAttribute('viewBox', viewBoxes[pageIndex - 1]);
    } else {
      changeArea();
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
})();
