$(document).ready(function () {
  var root = $("#profile");
  if (root.length) {
    let tagsSelected = 0;

    $("#search-nav").val(lastSearchedGamer);

    // Methods
    var toggleSigninSignup = function () {
      $(".js-review-modal").addClass("uk-active");
    }

    // Review Modal
    var tags = [];
    var remaining_char = 5000;
    var review_type_global = null;
    var canGoToSelectAttributesModal = false;

    var validateReviewModalData = function() {
      let result = true;
      if ($('.review-type-container').find('.selected').length === 0) result = false;
      if (!$('.tags-textarea').val()) result = false;
      if (result) {
        canGoToSelectAttributesModal = true;
        $('.review-next-button').removeClass('disabled');
      } else {
        canGoToSelectAttributesModal = false;
        $('.review-next-button').addClass('disabled');
      }
    }

    var reviewPlayer = function() {
      var url = "/review";
      var comment = $('.tags-textarea').val();
      var id = $('.gid').val();

      if (id && comment && review_type_global) {
        var data = {
          id: id,
          comment: comment,
          review_type: review_type_global,
          tags: tags,
        }
        return new Promise((resolve, reject) => {
          resolve(doApiCall('POST', data, url));
        }).then(function (apiResult) {
          if (apiResult.success) {
            console.log("SUCCESS");
            location.reload();
          } else {
            console.log("ERROR");
          }
        });
      }
    }

    const toggleAttr = function(target) {
      const button = $(target);
      const checkbox = $(target).find('.checkbox');

      if (!button.hasClass('selected') && tagsSelected < 2) {
        button.addClass('selected');
        checkbox.addClass('selected');
        tagsSelected += 1;
        tags.push({
          id: button.attr('id'),
          name: button.find('.attr-name').html()
        })
      } else if (button.hasClass('selected')) {
        tags = tags.filter((tag) => {
          return tag.id !== button.attr('id');
        });
        tagsSelected -= 1;
        button.removeClass('selected');
        checkbox.removeClass('selected');
      }
    }

    $("#search-icon-nav").click(function () {
      search_lol_player();
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
      validateReviewModalData();
      $('.up-button').addClass('uk-active');
      $('.down-button').removeClass('uk-active');
      review_type_global = "REP";
    });

    $('.down-button').click(function () {
      validateReviewModalData();
      $('.down-button').addClass('uk-active');
      $('.up-button').removeClass('uk-active');
      review_type_global = "FLAME";
    });

    $('.tags-textarea').keydown(function(e) {
      $('.review-remaining').html(`${remaining_char - $('.tags-textarea').val().length} characters remainings`);
    });

    $('.tags-textarea').keyup(function (e) {
      validateReviewModalData();
    });

    $('.review-select-btn.attr').click((e) => {
      toggleAttr(e.currentTarget);
    });

    $('.review-next-button').click((e) => {
      if (canGoToSelectAttributesModal) {
        UIkit.modal('#attributes-modal').toggle();
      }
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