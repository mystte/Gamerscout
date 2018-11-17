$(document).ready(function () {
  var root = $("#profile");
  if (root.length) {

    var lastSearchedGamer = sessionStorage.getItem('gts');
    var lastSearchedRegion = sessionStorage.getItem('rts');
    $("#search-nav").val(lastSearchedGamer);

    // Methods
    var toggleSigninSignup = function () {
      $(".js-review-modal").addClass("uk-active");
    }

    // Review Modal
    var tags = [];
    var remaining_char = 5000;
    var review_type_global = null;

    // Modal methods
    var selectTag = function(tagName) {
      if (tags.indexOf(tagName) === -1 && tags.length <= 2) {
        tags.push(tagName);
      }
      showSelectedTags();
    }

    var unselectTag = function(tagName) {
      var tagToDelete = tags.indexOf(tagName);
      if (tagToDelete !== -1) {
        tags.splice(tagToDelete, 1);  
      }
      showSelectedTags();
    }

    var showSelectedTags = function() {
      var htmlTags = '';
      tags.forEach(function(elem) {
        htmlTags += `<span data-name='${elem}' class='tag uk-button uk-button-default js-delete-tag'><span class='text'>${elem}</span><span uk-icon="icon: close; ratio: 0.5"></span></span>`;
      });
      $('.tags-list').html(htmlTags);
      $('.js-delete-tag').click(function (e) {
        e.stopPropagation();
        unselectTag(this.dataset.name);
      });
    }

    var getSelectedTagsForApi = function() {
      return tags.map((tag) => {
        return {
          name: tag,
          type: $(`.${tag}`).eq(0).data('type'),
          id: $(`.${tag}`).eq(0).data('id'),
        };
      });
    }

    var reviewPlayer = function () {
      var url = "/review";
      var comment = $('.tags-textarea').val();
      var id = $('.gid').val();
      console.log(getSelectedTagsForApi());
      if (id && comment && review_type_global) {
        var data = {
          id: id,
          comment: comment,
          review_type: review_type_global,
          tags: getSelectedTagsForApi(),
        }
        return new Promise((resolve, reject) => {
          resolve(doApiCall('POST', data, url));
        }).then(function (apiResult) {
          console.log("C'est review", apiResult);
          if (apiResult.success) {
            console.log("SUCCESS");
            location.reload();
          } else {
            console.log("ERROR");
          }
        });
      }
    }

    $('#search-nav').keypress(function(event){
    if(event.keyCode == 13){
      $('#search-icon-nav').click();
    }
    });

    $('#search-nav-mobile').keypress(function(event){
      if(event.keyCode == 13){
        $('#search-icon-nav-mobile').click();
      }
    });

    $("#search-icon-nav").click(function () {
      var region = $('#region-selection-nav').val();
      var gamertag = $('#search-nav').val();
      var profile_url = "/profile/lol/" + region.toLowerCase() + "1/" + gamertag;
      gtt = gamertag.trim()
      if (gtt.length > 0){
        sessionStorage.setItem('gts', gamertag);
        sessionStorage.setItem('rts', region);
        window.location.href = profile_url;
      }
    });

    $("#navbar-mobile-search").click(function () {
      $('#top-menu').css('display', 'none');
      $('#top-menu-mobile').css('display', 'flex');
    });

    $('#back-icon').click(function(){
      $('#top-menu').css('display', 'flex');
      $('#top-menu-mobile').css('display', 'none');
    });

    $("#search-icon-nav-mobile").click(function () {
      var region = $('#region-selection-nav-mobile').val();
      var gamertag = $('#search-nav-mobile').val();
      var profile_url = "/profile/lol/" + region.toLowerCase() + "1/" + gamertag;
      gtt = gamertag.trim()
      if (gtt.length > 0){
        sessionStorage.setItem('gts', gamertag);
        sessionStorage.setItem('rts', region);
        window.location.href = profile_url;
      }
    });


    $('.js-submit-review').click(function () {
      reviewPlayer();
    });

    $('.js-add-tag').click(function(e) {
      e.stopPropagation();
      selectTag(this.dataset.name);
    });

    $('.js-delete-tag').click(function (e) {
      e.stopPropagation();
      unselectTag(this.dataset.name);
    });

    $('.up-button').click(function () {
      $('.up-button').addClass('uk-active');
      $('.down-button').removeClass('uk-active');
      review_type_global = "REP";
    });

    $('.down-button').click(function () {
      $('.down-button').addClass('uk-active');
      $('.up-button').removeClass('uk-active');
      review_type_global = "FLAME";
    });

    $('.tags-textarea').keydown(function(e) {
      $('.review-remaining').html(`${remaining_char - $('.tags-textarea').val().length} characters remainings`);
    });

    $('.profile-comment-section').on('click', '#see-more', function(event){
      var target = event.target || event.srcElement;
      if(target.innerHTML === "SHOW MORE"){
        target.parentElement.previousElementSibling.style.maxHeight = "100%";
        target.innerHTML = "SHOW LESS";
      } else {
        target.parentElement.previousElementSibling.style.maxHeight = "120px";
        target.innerHTML = "SHOW MORE";
      }
    });


  }
});