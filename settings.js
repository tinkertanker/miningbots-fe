var settings_window;
const default_settings={
    "enable_security":false,
    "localhost_port":9003,
    "show_player_names":true
}
function write_settings(){
    let json_settings={
        "enable_security":document.querySelector("#secure-protocols-setting-value").checked,
        "localhost_port":parseInt(document.querySelector("#localhost-port-setting-value").value),
        "show_player_names":document.querySelector("#name-display-setting-value").checked
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
    let cookie_value=getCookie("settings");
    if(cookie_value)return JSON.parse(decodeURI(cookie_value));
    else return default_settings;
}
function initialize_popup(){
    let json_settings=read_settings_cookie();
    document.querySelector("#secure-protocols-setting-value").checked=json_settings["enable_security"];
    document.querySelector("#localhost-port-setting-value").value=json_settings["localhost_port"].toString();
    document.querySelector("#name-display-setting-value").checked=json_settings["show_player_names"];
    window.addEventListener("keydown",(event)=>{
        if(event.key=="Escape")cancel_clicked();
    })
}
function initialize_main(){
    if(navigator.onLine){
      update_settings_button_visibility();
      window.addEventListener("keydown",(event)=>{
        if(event.ctrlKey && event.altKey && event.key=="c") {
          settings_window=open_popup(); // weird browser error: popup blocker when triggered by non-mouse event (e.g. keyboard here)
          event.preventDefault();
        } else if(event.ctrlKey && event.altKey && event.key=="d") {
          toggle_settings_button();
          event.preventDefault();
        } else if(event.ctrlKey && event.key=="h") {
          show_help();
          event.preventDefault();
        }
      });
    }
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

function read_settings_button_visibility_cookie(){
    let displayed=getCookie("settings_button_displayed");
    if(!displayed)return true;//if cookie value is falsy (cookie cannot be read), assume value is true
    return displayed=="true";
}

function update_settings_button_visibility(){
    set_settings_button_visibility(read_settings_button_visibility_cookie());
}

function set_settings_button_visibility(displayed){
    document.querySelector("#settings-button").style.visibility=displayed?"visible":"collapse";
}

function toggle_settings_button(){
    //invert the boolean in the settings_button_displayed cookie
    let displayed=read_settings_button_visibility_cookie();
    let new_displayed=!displayed;
    setCookie("settings_button_displayed",new_displayed.toString(),"Fri, 31 Dec 9999 23:59:59 GMT");
    set_settings_button_visibility(new_displayed);
}
