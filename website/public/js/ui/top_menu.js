$(document).ready(function () {
  let showMobileSearchBar = () => {
    $('#top-menu-mobile > .nav-container').css('display', 'none');
    $('#top-menu-mobile > .search-bar-mobile').css('display', 'flex');
    $('#top-menu > h1').css('display', 'none');
  }

  let hideMobileSearchBar = () => {
    $('#top-menu-mobile > .nav-container').css('display', 'flex');
    $('#top-menu-mobile > .search-bar-mobile').css('display', 'none');
    $('#top-menu > h1').css('display', 'flex');
  }

  var root = $("#top-menu");
  if (root.length) {

    $('#top-menu-mobile > div.nav-container > img').click(() => {
      showMobileSearchBar();
    });

    $('#search-back-icon').click(() => {
      hideMobileSearchBar();
    });
  }
});
