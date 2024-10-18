function write_settings(){
    let json_settings={
        "enable_security":document.querySelector("#secure-protocols-setting-value").checked,
        "localhost_port":parseInt(document.querySelector("#localhost-port-setting-value").value)
    };
    let cookie_value=encodeURI(JSON.stringify(json_settings));
    setCookie("settings",cookie_value,"Fri, 31 Dec 9999 23:59:59 GMT");
}
function read_settings_cookie(){
    return JSON.parse(decodeURI(getCookie("settings")));
}
function initialize(){
    let json_settings=read_settings_cookie();
    document.querySelector("#secure-protocols-setting-value").checked=json_settings["enable_security"];
    document.querySelector("#localhost-port-setting-value").value=json_settings["localhost_port"].toString();
}
function open_popup(){
    // Position of popup
    let width=400;
    let height=600;
    let left=Math.floor((window.innerWidth/2)-(width/2));
    let top=Math.floor((window.innerHeight/2)-(height/2));
    window.open('/settings.html','_blank',`popup=yes,width=${width},height=${height},left=${left},top=${top}`);
}

function close_popup(){
    write_settings();
    window.opener.location.reload();
    window.close();
}