// inputIds must be an array of id
function showInputError(inputIds, message = null, messageInputId = null, ) {
  inputIds.forEach(function(inputId) {
    var input = $('#' + inputId);
    if (!input.hasClass("uk-form-danger")) {
      input.addClass("uk-form-danger");
    }
    if (message) {
      var errorMsg = (messageInputId) ? $('#' + messageInputId) : $('.input-error-msg');
      errorMsg.css('visibility', 'visible');
      errorMsg.html(message);
    }
  });
}

// Hide input errors based on inputIds
function hideInputErrors(inputIds) {
  inputIds.forEach(function(inputId) {
    var input = $('#' + inputId);
    if (input.hasClass("uk-form-danger")) {
      input.removeClass("uk-form-danger");
    }
  });
}

// Hide all input errors
function hideAllInputErrors() {
  var inputs = $('input');
  var labels = $('label');
  var links = $('a');
  var errorMsg = $('.input-error-msg');
  if (inputs.hasClass("uk-form-danger")) {
    inputs.removeClass("uk-form-danger");
  }
  if (labels.hasClass("uk-form-danger")) {
    labels.removeClass("uk-form-danger");
  }
  if (links.hasClass("uk-form-danger")) {
    links.removeClass("uk-form-danger");
  }
  errorMsg.css('visibility', 'hidden');
}
