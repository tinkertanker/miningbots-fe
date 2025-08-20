const SocketUtilities = {
    getNameOfSocket: function(socket) {
        return socket.split(":", 1)[0];
    },
    getPortNumber: function(protocol,socket){
        var socket_parts=socket.split(":",2);
        if(socket_parts.length>1){
            return parseInt(socket_parts[1]);
        } else {
            if (protocol=="https"){
                return 443;
            } else if (protocol=="http") {
                return 80;
            }
        }
        return null;
    },
    isValidSocket: function(string) {
        let url;
        if(string.indexOf('/')!=-1) 
            return false; // Invalid if it contains a slash (protocol or virtual path in socket)
        let urlString="http://"+string;
        
        try {
            url = new URL(urlString);
        } catch (_) {
            return false;  
        }

        if(string.indexOf(':')!=-1 && url.port.length==0) 
            return false; // Invalid if it has a :(port specifier) but no port number

        return true;
    }
};
