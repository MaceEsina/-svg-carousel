(function() {
  'use strict';
  var DELAY = 700;

  var nextButton = document.getElementById('next');
  var prevButton = document.getElementById('prev');
  var switchButton = document.getElementById('switch');
  var end = document.getElementById('end');

  var pages = document.getElementsByClassName('page');
  var rects = document.getElementsByClassName('rect');
  var areas = getAreas(pages[0]);
  var viewBoxes = [].map.call(pages, function(page) {
    return page.getAttribute('viewBox');
  });

  var isPageMode = false;
  var pageIndex = 0;
  var areaIndex = -1;
  var maxPageIndex = pages.length - 1;
  var activePage = pages[pageIndex];

  nextButton.addEventListener('click', next);
  prevButton.addEventListener('click', prev);
  switchButton.addEventListener('click', switchMode);

  function next() {
    if (isPageMode) {
      nextPage();
    } else {
      nextArea();
    }
  }

  function nextArea() {
    if (isLastArea()) {
      if (isLastPage()) {
        end.className = 'visible';
        return;
      } else {
        nextPage();
      }
    } else {
      areaIndex++;
    }

    console.log(pageIndex, areaIndex);
    var activeArea = areas[areaIndex];
    var activeRect = rects[pageIndex];
    var points = activeArea.getAttribute('points').split(' ');
    var xy1 = points[0].split(',');
    var xy2 = points[1].split(',');
    var xy3 = points[2].split(',');
    var box = [xy1[0], xy1[1], xy2[0] - xy1[0], xy3[1] - xy2[1]];

    pages[pageIndex].setAttribute('viewBox', box.join(' '));
    activeRect.setAttribute('x', xy1[0]);
    activeRect.setAttribute('y', xy1[1]);
  }

  function nextPage() {
    var activePage = pages[++pageIndex];

    pages[pageIndex - 1].classList.remove('active');
    activePage.classList.add('active');
    areas = getAreas(activePage);
    areaIndex = 0;

    nextButton.disabled = true;
    prevButton.disabled = false;
    setTimeout(function() {
      nextButton.disabled = isLastPage();
    }, DELAY);
  }

  function prevPage() {
    activePage.classList.remove('active');
    activePage = pages[--pageIndex];
    activePage.classList.add('active');
    areas = getAreas(activePage);

    prevButton.disabled = true;
    nextButton.disabled = false;
    setTimeout(function() {
      prevButton.disabled = isFirstPage();
    }, DELAY);
  }

  function switchMode() {
    isPageMode = !isPageMode;
  }

  function isLastPage() {
    return pageIndex >= maxPageIndex;
  }

  function isFirstPage() {
    return pageIndex <= 0;
  }

  function isLastArea() {
    return areaIndex >= getMaxAreaIndex();
  }

  function isFirstArea() {
    return areaIndex <= 0;
  }

  function getAreas(elem) {
    return elem.getElementsByTagName('polygon');
  }

  function getMaxAreaIndex() {
    return areas.length - 1;
  }
})();
