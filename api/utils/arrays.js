exports.findIdInArray = function(arr, search) {
  var res = -1;
    var len = arr.length;
    while( len-- ) {
        if(arr[len]._id.toString() === search.toString()) {
          res = len;
          return len;         
        }
    }
    return -1;
}

exports.getRandomRows = function(array, n) {
  const shuffled = array.sort(() => .5 - Math.random());
  let selected = shuffled.slice(0,n) ;
  return selected;
}

exports.findObjectInJson = function(obj, key, value) {
  var res = -1;
  Object.keys(obj).forEach(function (k) {
    if (obj[k][key] == value) {
      res = obj[k];
      return;
    }
  });
  return res;
}