$(document).ready(function () {
  var root = $("#profile");
  if (root.length) {

    // Methods
    var toggleSigninSignup = function () {
      $(".js-review-modal").addClass("uk-active");
    }

    // Review Modal
    var tags = [];
    var remaining_char = 5000;

    // Modal methods
    var selectTag = function(tagName) {
      if (tags.indexOf(tagName) === -1 && tags.length <= 2) {
        tags.push(tagName);
      }
      showSelectedTags();
    }

    var unselectTag = function(tagName) {
      console.log('UNSELECT TAG', tagName);
      var tagToDelete = tags.indexOf(tagName);
      if (tagToDelete !== -1) {
        tags.splice(tagToDelete, 1);  
      }
      showSelectedTags();
    }

    showSelectedTags = function() {
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

    $('.js-add-tag').click(function(e) {
      e.stopPropagation();
      selectTag(this.dataset.name);
    });

    $('.js-delete-tag').click(function (e) {
      e.stopPropagation();
      unselectTag(this.dataset.name);
    });

    $('.tags-textarea').keydown(function(e) {
      $('.review-remaining').html(`${remaining_char - $('.tags-textarea').val().length} characters remainings`);
    });
  }
});