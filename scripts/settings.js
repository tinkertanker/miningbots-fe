var settings_window;
const settings = {
    "enable_security": {
        "type":"boolean",
        "default":false,
        "title":"Use secure protocols",
        "description":"Use HTTPS and WSS over HTTP and WS"
    },
    "game_port": {
        "type":"number",
        "default":9001,
        "title":"Game Port number",
        "description":"Port number used when connecting to the &quot;Staging&quot;, &quot;Main Game&quot;, &quot;Game&quot; servers",
        "range": {
            "minimum":1,
            "maximum":65535
        }
    },
    "localhost_port": {
        "type":"number",
        "default":9003,
        "title":"Testing Port number",
        "description":"Port number used when connecting to the &quot;Testing&quot; server",
        "range": {
            "minimum":1,
            "maximum":65535
        }
    },
    "observer_key": {
        "type":"number",
        "title": "Observer key",
        "description":"Observer key used to subscribe to the server",
        "default":514525537,
        "range":"unbound"
    },
    "show_player_names": {
        "type":"boolean",
        "title":"Show player names",
        "description":`Show player names next to the player IDs in the sidebars and Winner Display
          Dialog.<br>
          When on, player sidebar headers will look like this: &quot;Player: 3067498284 (Team's Team)&quot;<br>
          When off,player sidebar headers will look like this: &quot;Player: 3067498284&quot;`,
        "default":true
    },
    "show_gameid": {
        "type":"boolean",
        "title": "Debugging: Display Game ID",
        "description":`Display the Game ID in the top right corner.<br>
          NOTE: If the UI Mode is set to &quot;fullscreen&quot;, the Game ID will also be hidden.`,
        "default":true
    },
    "show_game_status": {
        "type":"boolean",
        "title": "Debugging: Display Game Status",
        "description":`Display the Game Status in the top right corner.<br>
          NOTE: If the UI Mode is set to &quot;fullscreen&quot;, the Game Status will also be hidden.`,
        "default":true
    },
    "show_notifications": {
        "type":"boolean",
        "title":"Debugging: Enable push notifications",
        "description":`Enable push notifications when certain events happen (e.g. player
          joined)<br>
          NOTE: If the UI Mode is set to &quot;fullscreen&quot;, Push Notifications will be disabled.`,
        "default":true
    },
    "theme": {
        "type":"setpicker",
        "default":"auto",
        "title":"Theme",
        "description":"Set the application theme",
        "range": [
            {"name":"light","display":"Light"},
            {"name":"dark","display":"Dark"},
            {"name":"auto","display":"Automatic (follow browser theme)"}
        ]
    },
}
const default_settings=(function(){
    keys=Object.keys(settings);
    let default_settings={};
    keys.forEach((key)=>{
        default_settings[key]=settings[key]["default"];
    })
    return default_settings;
})();
function write_settings(json_settings) {
    let cookie_value = encodeURI(JSON.stringify(json_settings));
    setCookie("settings", cookie_value, "Fri, 31 Dec 9999 23:59:59 GMT");
    if(json_settings["show_notifications"]){
        switch(Notification.permission){
            case "default":
                // code from https://riptutorial.com/javascript/example/2305/requesting-permission-to-send-notifications
                askForNotificationPermission().then((permission)=>{
                    if (!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                    if(!notificationPermissionGranted()){
                        alert("Notifications are unavailable");
                        document.getElementById("show-notifications-setting-value").checked=false;
                    }
                },()=>{
                    alert("Notifications are unavailable");
                    document.getElementById("show-notifications-setting-value").checked=false;
                });
                alert("To enable notifications completely, allow notifications.");
                break;
            case "denied":
                alert("Notifications disabled from browser. Please clear notification permission and try again.");
                break;
            case "granted":
                ; // Permission allowed! Do nothing.
        }
    }
    return false;
}
function write_displayed_settings() {
    /*let json_settings = {
        "enable_security": document.getElementById("secure-protocols-setting-value").checked,
        "game_port": parseInt(document.getElementById('game-port-setting-value').value),
        "localhost_port": parseInt(document.getElementById("localhost-port-setting-value").value),
        "observer_key": parseInt(document.getElementById("observer-key-setting-value").value),
        "show_player_names": document.getElementById("name-display-setting-value").checked,
        "show_gameid": document.getElementById("gameid-display-setting-value").checked,
        "show_game_status": document.getElementById("game-status-display-setting-value").checked,
        "show_notifications": document.getElementById("show-notifications-setting-value").checked,
        "theme": document.getElementById("theme-setting-value").value
    };*/
    let json_settings={};
    Object.keys(settings).forEach(key=>{
        let source=document.getElementById(key+'_input');
        source_property=settings[key].type=="boolean" ? "checked" : "value"
        json_settings[key]=source[source_property];
    });
    let error=write_settings(json_settings);
    return error;
}
function write_default_settings() {
    write_settings();
    window.opener.location.reload();
    display_settings(default_settings);
}
function reset_settings_clicked() {
    if (confirm(`Are you sure you want to reset the settings?
This cannot be undone!`)) {
        write_default_settings();
    }
}
function apply_clicked() {
    let error=write_displayed_settings();
    window.opener.location.reload();
    if(error)alert("Error occured. Check for mistakes in the settings and try again.");
    return error;
}

function cancel_clicked() {
    window.close();
}

function ok_clicked() {
    let error=apply_clicked();
    if(!error)window.close();
}
function read_settings_cookie() {
    let settings=Object.assign({},default_settings);
    let cookie_value = getCookie("settings");
    if (cookie_value){
        let cookie=JSON.parse(decodeURI(cookie_value));
        Object.keys(cookie).forEach((key)=>{
           if(default_settings.hasOwnProperty(key)){ // make sure key is valid
             settings[key]=cookie[key];
           } 
        });
    }
    return settings;
}
function display_settings(json_settings) {
    /*document.getElementById("secure-protocols-setting-value").checked = json_settings["enable_security"];
    document.getElementById("game-port-setting-value").value = json_settings["game_port"].toString();
    document.getElementById("localhost-port-setting-value").value = json_settings["localhost_port"].toString();
    document.getElementById("observer-key-setting-value").value = json_settings["observer_key"].toString();
    document.getElementById("name-display-setting-value").checked = json_settings["show_player_names"];
    document.getElementById("gameid-display-setting-value").checked = json_settings["show_gameid"];
    document.getElementById("game-status-display-setting-value").checked = json_settings["show_game_status"];
    document.getElementById("show-notifications-setting-value").checked = json_settings["show_notifications"]&&notificationPermissionGranted();
    document.getElementById("theme-setting-value").value = json_settings["theme"]; */
    Object.keys(json_settings).forEach(key=>{
        let destination=document.getElementById(key+'_input');
        destination_property=settings[key].type=="boolean" ? "checked" : "value"
        destination[destination_property]=json_settings[key];
        update_reset_button({"key":key,"value":json_settings[key]});
    });
}
function setChecked(element){
    if(element.checked)element.classList.add("checkbox-checked");
    else element.classList.remove("checkbox-checked");
}
function populate_settings(){
    const root_container=document.getElementById("settings-megacontainer");

    keys=Object.keys(settings);
    keys.forEach((key)=>{
        let setting_div=document.createElement("div");
        setting_div.classList.add("setting-container");
        setting_div.setAttribute("id",key);
        let text_container=document.createElement("div");
        text_container.classList.add("setting-text-container");
        let title=document.createElement("label");
        title.setAttribute('for',key+'_input');
        title.classList.add("setting-text-name");
        title.innerHTML=settings[key]["title"];
        text_container.appendChild(title);
        let description=document.createElement("p");
        description.classList.add("setting-text-description");
        description.innerHTML=settings[key]["description"];
        text_container.appendChild(description);
        setting_div.appendChild(text_container);

        let right_box=document.createElement("div");
        right_box.classList.add("settings-right-box");
        let reset_button=document.createElement("a");
        let accessibility_text=`Reset the ${settings[key]['title']} setting to default`;
        reset_button.id=key+'_reset';
        reset_button.href='#';
        reset_button.title=accessibility_text;
        reset_button.setAttribute('role','button');
        reset_button.addEventListener("click",(e)=>{
            e.preventDefault();
            reset_setting(key);
        });
        let reset_icon=document.createElement('img');
        reset_icon.src="/images/reset.png";
        //reset_icon.alt=accessibility_text;
        reset_icon.classList.add("reset-icon");
        reset_button.appendChild(reset_icon);
        right_box.appendChild(reset_button);

        let input_element=document.createElement("input");
        switch(settings[key]["type"]){
            case "boolean":
                input_element.type="checkbox";
                break;
            case "number":
                input_element.type="number";
                if(typeof settings[key]["range"]=="object"){
                    input_element.min=settings[key]["range"]["minimum"];
                    input_element.max=settings[key]["range"]["maximum"];
                }
                break;
            case "setpicker":
                input_element=document.createElement("select");
                settings[key]["range"].forEach(option=>{
                    let option_element=document.createElement("option");
                    option_element.setAttribute("value",option["name"]);
                    option_element.innerHTML=option["display"];
                    input_element.appendChild(option_element);
                });
                break;
            default:
                input_element.type="hidden"; // disable it
                break;
        }
        input_element.setAttribute("id",key+'_input');
        input_element.classList.add("setting-value");
        input_element.addEventListener('change',(e)=>{
            let property=settings[key]["type"]=="boolean"?"checked":"value";
            let update={"key":key,"value":e.target[property]};
            onChange(update);
        })
        right_box.appendChild(input_element);
        setting_div.appendChild(right_box);
        root_container.appendChild(setting_div);
    })

    // move the reset button to the bottom
    let reset_all_button=document.getElementById("reset_button_container");
    root_container.removeChild(reset_all_button);
    root_container.appendChild(reset_all_button);
}

function update_reset_button(setting_update){
    let show=setting_update["value"]!=settings[setting_update["key"]]["default"]; // true if the value is not equal to the default
    document.getElementById(setting_update["key"]+'_reset').style.display=show?"block":"none";
}

function reset_setting(setting_key){
    let update={};
    update[setting_key]=settings[setting_key]["default"];
    display_settings(update);
    onChange({"key":setting_key,"value":update[setting_key]});
}

function initialize_popup() {
    populate_settings();
    let json_settings = read_settings_cookie();
    display_settings(json_settings);
    pairDarkMode(json_settings);
    setDarkMode(darkModeEnabled(json_settings));
    document.querySelectorAll("input.setting-value[type='checkbox']").forEach((element)=>{
        element.addEventListener("click",(e)=>{
            setChecked(e.target);
        });
        setChecked(element);
    });
    window.addEventListener("keydown", (event) => {
        if (event.key == "Escape") cancel_clicked();
    });
}
function initialize_main(production_status) {
    if (navigator.onLine && !production_status) {
        window.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.altKey && event.key == "c") {
                settings_window = open_popup(); // weird Firefox browser error: popup blocker when triggered by non-mouse event (e.g. keyboard here)
                event.preventDefault();
            }  else if (event.ctrlKey && event.key == "h") {
                show_help();
                event.preventDefault();
            }
        });
    }
}

function onChange(setting_update){
    if(setting_update["key"]=="theme"){
        setDarkMode(darkModeEnabled({"theme":setting_update["value"]}));
    }

    if(settings[setting_update["key"]]["type"]=="boolean"){ // call setChecked only on boolean options
        setChecked(document.getElementById(setting_update["key"]+'_input'));
    }

    update_reset_button(setting_update);
}

function open_popup() {
    // Position of popup
    let width = 400;
    let height = 600;
    let left = Math.floor((screen.width / 2) - (width / 2));
    let top = Math.floor((screen.height / 2) - (height / 2));
    return window.open('/settings.html', '_blank', `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
}
