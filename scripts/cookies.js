let CookieUtilities = {
   // Convert a Date object into a cookie-styled expiry date
   createExpiryDate: function(date) {
      var day = date.toLocaleString('default', { weekday: 'short' });
      var dd = String(date.getDate()).padStart(2, '0');
      var month = date.toLocaleString('default', { month: 'short' });
      var yyyy = date.getFullYear();
      var hour = String(date.getUTCHours()).padStart(2, '0');
      var minute = String(date.getUTCMinutes()).padStart(2, '0');
      var second = String(date.getUTCSeconds()).padStart(2, '0');
      return day + ', ' + dd + ' ' + month + ' ' + yyyy + ' ' + hour + ':' + minute + ':' + second + ' UTC';
   },
   setCookie:function(name, value, expiry, path) {
      cookie = `${name}=${value}`;
      if (expiry != "session") {
         cookie += `;expires=${expiry}`;
      }
      if (path !== null) {
         cookie += `;path=${path}`;
      }
      document.cookie = cookie;
   },
   getCookie:function(name) {
      return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))
         ?.split("=")[1];
   }
}

CookieUtilities.hasCookie=function(name){
   return CookieUtilities.getCookie(name)!=undefined;
}

CookieUtilities.deleteCookie=function(name){
   CookieUtilities.setCookie(name,"deleted",'Thu, 1 Jan 1970 00:00:00');
}
