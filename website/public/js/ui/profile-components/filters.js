$(document).ready(function () {
  var root = $("#review-filters");
  const filters = {
    NEWEST: 'NEWEST',
    OLDEST: 'OLDEST',
    ALL: "ALL",
    APPROVALS: "APPROVALS",
    DISAPPROVALS: "DISAPPROVALS"
  }

  let getQueryString = (key) => {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  }

  if (root.length) {
    let currentFilter = getQueryString('filter') ? getQueryString('filter') : filters.ALL;
    let currentSort = getQueryString('sort') ? getQueryString('sort') : filters.NEWEST;
    let currentItems = getQueryString('limit') ? +getQueryString('limit') : 5;
    let currentPage = getQueryString('page') ? +getQueryString('page') : 1;
    const totalPages = $('.total-pages').html() ? +$('.total-pages').html().substr(1) : 0;

    $("ul.uk-nav.uk-dropdown-nav.newest > a").click(() => {
      if (currentSort !== filters.NEWEST) {
        currentSort = filters.NEWEST;
        applyFilters();
      }
    })

    $("ul.uk-nav.uk-dropdown-nav.oldest > a").click(() => {
      if (currentSort !== filters.OLDEST) {
        currentSort = filters.OLDEST;
        applyFilters();
      }
    })

    $("ul.uk-nav.uk-dropdown-nav.all > a").click(() => {
      if (currentFilter !== filters.ALL) {
        currentFilter = filters.ALL;
        applyFilters();
      }
    })

    $("ul.uk-nav.uk-dropdown-nav.approvals > a").click(() => {
      if (currentFilter !== filters.APPROVALS) {
        currentFilter = filters.APPROVALS;
        applyFilters();
      }
    })

    $("ul.uk-nav.uk-dropdown-nav.disapprovals > a").click(() => {
      if (currentFilter !== filters.DISAPPROVALS) {
        currentFilter = filters.DISAPPROVALS;
        applyFilters();
      }
    })

    $(".uk-nav.uk-dropdown-nav.review-number-nav.5").click((event) => {
      if (currentItems !== 5) currentItems = 5;
      applyFilters();
    });

    $(".uk-nav.uk-dropdown-nav.review-number-nav.10").click((event) => {
      if (currentItems !== 10) currentItems = 10;
      applyFilters();
    });

    $(".uk-nav.uk-dropdown-nav.review-number-nav.15").click((event) => {
      if (currentItems !== 15) currentItems = 15;
      applyFilters();
    });

    $(".uk-nav.uk-dropdown-nav.review-number-nav.20").click((event) => {
      if (currentItems !== 20) currentItems = 20;
      applyFilters();
    });

    $("div.page-selector-container > button.next-page.next-previous-button").click((event) => {
      if (currentPage < totalPages) {
        currentPage += 1;
        applyFilters();
      }
    });

    $("div.page-selector-container > button.previous-page.next-previous-button").click((event) => {
      if (currentPage > 1) {
        currentPage -= 1;
        applyFilters();
      }
    })

    $("#review-pagination-container > div.page-selector-container > input").keypress((e) => {
      const currentValue = $("#review-pagination-container > div.page-selector-container > input").val();
      if (e.keyCode == '13') { // enter
        if (currentValue) {
          currentPage = currentValue;
          applyFilters();
          return;
        }
      }
      const newValue = +`${currentValue}${e.key}`;
      if (!(newValue > 0 && newValue <= totalPages)) {
        e.preventDefault()
      }
    });

    $("#review-pagination-container > div.page-selector-container > input").blur((e) => {
      $("#review-pagination-container > div.page-selector-container > input").val(+getQueryString('page'));
    });

    let applyFilters = function() {
      const gamertag = $('#lol-summary-section > .gamertag').val();
      const region = $("#lol-summary-section > .region").val();
      const url = `/profile/lol/${region}/${gamertag}?sort=${currentSort}&filter=${currentFilter}&limit=${currentItems}&page=${currentPage}#reviews`;

      window.location.replace(url);
    }
  }
});