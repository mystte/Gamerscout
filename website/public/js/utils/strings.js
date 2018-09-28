// Is not null or full of spaces
function exists(string) {
  let result = true;
  if (!string.replace(/\s/g, '').length) result = false;
  if (string === null) result = false;
  if (typeof string === 'undefined') result = false;
  return result;
}