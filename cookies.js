// Convert a Date object into a cookie-styled expiry date
function createExpiryDate(date) {
   var day = date.toLocaleString('default', { weekday: 'short' });
   var dd = String(date.getDate()).padStart(2, '0');
   var month = date.toLocaleString('default', { month: 'short' });
   var yyyy = date.getFullYear();
   var hour = String(date.getUTCHours()).padStart(2, '0');
   var minute = String(date.getUTCMinutes()).padStart(2, '0');
   var second = String(date.getUTCSeconds()).padStart(2, '0');
   return day + ', ' + dd + ' ' + month + ' ' + yyyy + ' ' + hour + ':' + minute + ':' + second + ' UTC';
}

function setCookie(name, value, expiry, path) {
   cookie = `${name}=${value}`;
   if (expiry != "session") {
      cookie += `;expires=${expiry}`;
   }
   if (path !== null) {
      cookie += `;path=${path}`;
   }
   document.cookie = cookie;
}

function getCookie(name) {
   return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
}

function hasCookie(name){
   return getCookie(name)!=undefined;
}

function deleteCookie(name){
   setCookie(name,"deleted",'Thu, 1 Jan 1970 00:00:00');
}
