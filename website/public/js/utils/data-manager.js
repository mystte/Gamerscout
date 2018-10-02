// Do api call using ajax request and return the result
async function doApiCall(type, data, url) {
  // TO DO
  // Translate error messages
  var result = {
    error : {
      msg: 'Cannot operate api call',
    }
  };

  if (type && data && url) {
    var modal = UIkit.modal($('#loader-modal'));
    modal.toggle();
    await $.ajax({
      contentType: "application/json",
      type: type,
      data: JSON.stringify(data),
      url: url,
      success: function (apiResult) {
        if ((apiResult.statusCode >= 200 && apiResult.statusCode <= 301) || (!apiResult.error && apiResult.message)) {
          delete result.error;
          result.success = 1;
          result.data = apiResult;
          modal.toggle();
        } else {
          // Change api call return object format in server
          result.error.msg = apiResult.error.error;
          modal.toggle();
        }
      },
      error: function (error) {
        modal.toggle();
      }
    });
  } else {
    console.log("Error : doApiCall misses required parameter");
  }
  return result;
}
