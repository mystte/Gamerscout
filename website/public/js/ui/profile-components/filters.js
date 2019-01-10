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

    let applyFilters = function() {
      const gamertag = $('#lol-summary-section > .gamertag').val();
      const region = $("#lol-summary-section > .region").val();
      const url = `/profile/lol/${region}/${gamertag}?sort=${currentSort}&filter=${currentFilter}`;

      window.location.replace(url);
    }
  }
});