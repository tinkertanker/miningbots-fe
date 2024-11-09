function getNameOfSocket(socket) {
    return socket.split(":", 1)[0];
}

function getPortNumber(protocol,socket){
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
}