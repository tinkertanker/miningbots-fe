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

function cleanupURL(url){
    if(/^[A-Za-z]+:/.test(url)){
        if(url.startsWith('http:')||url.startsWith('https:')){
            let slash_count=0;
            oldurl=url;
            url=url.substring(url.indexOf(':')+1,url.length);
            for (let index = 0; index < url.length; index++) {
                const element = url.charAt(index);
                if(element!='/'){
                    url=url.substring(index,url.length);
                    break;
                } else {
                    slash_count++;
                }

            }
            if(slash_count==0)url=oldurl;
            else if(slash_count==1)return null; //error
        }
    }
    let vp_start=url.indexOf('/'); // slash after socket
    if(vp_start!=-1){
        url=url.substring(0,vp_start);
    }
    return url;
}