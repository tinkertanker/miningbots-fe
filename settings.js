var settings_window;
function write_settings(){
    let json_settings={
        "enable_security":document.querySelector("#secure-protocols-setting-value").checked,
        "localhost_port":parseInt(document.querySelector("#localhost-port-setting-value").value)
    };
    let cookie_value=encodeURI(JSON.stringify(json_settings));
    setCookie("settings",cookie_value,"Fri, 31 Dec 9999 23:59:59 GMT");
}
function apply_clicked(){
	write_settings();
	window.opener.location.reload();
}

function cancel_clicked(){
	window.close();
}

function ok_clicked(){
	apply_clicked();
	window.close();
}
function read_settings_cookie(){
    return JSON.parse(decodeURI(getCookie("settings")));
}
function initialize(){
    let json_settings=read_settings_cookie();
    document.querySelector("#secure-protocols-setting-value").checked=json_settings["enable_security"];
    document.querySelector("#localhost-port-setting-value").value=json_settings["localhost_port"].toString();
    window.addEventListener("keydown",(event)=>{
        if(event.key=="Escape")cancel_clicked();
    })
}
function open_popup(){
    // Position of popup
    let width=400;
    let height=600;
    let left=Math.floor((window.innerWidth/2)-(width/2));
    let top=Math.floor((window.innerHeight/2)-(height/2));
    return window.open('/settings.html','_blank',`popup=yes,width=${width},height=${height},left=${left},top=${top}`);
}

function attachBeforeUnload(){
    addEventListener("beforeunload", (event)=>{
        if(!settings_window.closed){
            settings_window.close();
        }
        return false;
    });
}

function update_settings_button_visibility(){
    let displayed=getCookie("settings_button_displayed")=="true";
    document.querySelector("#settings-button").style.visibility=displayed?"visible":"collapse";
}

function toggle_settings_button(event){
    if (event.ctrlKey && event.altKey && event.key === 'd'){
        //invert the boolean in the settings_button_displayed cookie
        let displayed=getCookie("settings_button_displayed")=="true";
        let new_displayed=!displayed;
        setCookie("settings_button_displayed",new_displayed.toString(),"Fri, 31 Dec 9999 23:59:59 GMT");

        document.querySelector("#settings-button").style.visibility=new_displayed?"visible":"collapse";
        event.preventDefault();
    }
}