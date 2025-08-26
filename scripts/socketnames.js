const SocketUtilities = {
    getNameOfSocket: function(socket) {
        return socket.split(":", 1)[0];
    },
    applyDefaultPort: function(protocol, port) {
        if (port && (typeof port == "number" || (typeof port == "string" && port.length >= 0))) {
            if(typeof port == "string")
                return parseInt(port);
            else
                return port;
        } else {
            if (protocol === "https") {
                return 443;
            } else {
                return 80;
            }
        }
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

SocketUtilities.getPortNumber=function(protocol,socket){
    var socket_parts=socket.split(":",2);
    return SocketUtilities.applyDefaultPort(protocol, socket_parts[1]);
};