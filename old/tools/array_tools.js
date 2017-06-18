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