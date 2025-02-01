var settings_window;
const default_settings = {
    "enable_security": false,
    "game_port": 9001,
    "localhost_port": 9003,
    "show_player_names": true,
    "show_gameid": true,
    "show_game_status": true,
    "show_notifications": true,
    "theme": "auto"
}
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
    let json_settings = {
        "enable_security": document.getElementById("secure-protocols-setting-value").checked,
        "game_port": parseInt(document.getElementById('game-port-setting-value').value),
        "localhost_port": parseInt(document.getElementById("localhost-port-setting-value").value),
        "show_player_names": document.getElementById("name-display-setting-value").checked,
        "show_gameid": document.getElementById("gameid-display-setting-value").checked,
        "show_game_status": document.getElementById("game-status-display-setting-value").checked,
        "show_notifications": document.getElementById("show-notifications-setting-value").checked,
        "theme": document.getElementById("theme-setting-value").value
    };
    let error=write_settings(json_settings);
    return error;
}
function write_default_settings() {
    write_settings(default_settings);
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
    let cookie_value = getCookie("settings");
    if (cookie_value) return JSON.parse(decodeURI(cookie_value));
    else return default_settings;
}
function display_settings(json_settings) {
    document.getElementById("secure-protocols-setting-value").checked = json_settings["enable_security"];
    document.getElementById("game-port-setting-value").value = json_settings["game_port"].toString();
    document.getElementById("localhost-port-setting-value").value = json_settings["localhost_port"].toString();
    document.getElementById("name-display-setting-value").checked = json_settings["show_player_names"];
    document.getElementById("gameid-display-setting-value").checked = json_settings["show_gameid"];
    document.getElementById("game-status-display-setting-value").checked = json_settings["show_game_status"];
    document.getElementById("show-notifications-setting-value").checked = json_settings["show_notifications"]&&notificationPermissionGranted();
    document.getElementById("theme-setting-value").value = json_settings["theme"];
}
function setChecked(element){
    if(element.checked)element.classList.add("checkbox-checked");
    else element.classList.remove("checkbox-checked");
}
function initialize_popup() {
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
    })
}
function initialize_main(production_status) {
    if (navigator.onLine && !production_status) {
        //Is this needed?
        update_settings_button_visibility();
        window.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.altKey && event.key == "c") {
                settings_window = open_popup(); // weird Firefox browser error: popup blocker when triggered by non-mouse event (e.g. keyboard here)
                event.preventDefault();
            } else if (event.ctrlKey && event.altKey && event.key == "d") {
                //Is this needed?
                toggle_settings_button();
                event.preventDefault();
            } else if (event.ctrlKey && event.key == "h") {
                show_help();
                event.preventDefault();
            }
        });
    }
}
function open_popup() {
    // Position of popup
    let width = 400;
    let height = 600;
    let left = Math.floor((screen.width / 2) - (width / 2));
    let top = Math.floor((screen.height / 2) - (height / 2));
    return window.open('/settings.html', '_blank', `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
}

function attachBeforeUnload() {
    addEventListener("beforeunload", (event) => {
        if (!settings_window.closed) {
            settings_window.close();
        }
        return false;
    });
}

function read_settings_button_visibility_cookie() {
    let displayed = getCookie("settings_button_displayed");
    if (!displayed) return true;//if cookie value is falsy (cookie cannot be read), assume value is true
    return displayed == "true";
}

function update_settings_button_visibility() {
    set_settings_button_visibility(read_settings_button_visibility_cookie());
}

function set_settings_button_visibility(displayed) {
    document.getElementById("settings-button").style.visibility = displayed ? "visible" : "collapse";
}

function toggle_settings_button() {
    //invert the boolean in the settings_button_displayed cookie
    let displayed = read_settings_button_visibility_cookie();
    let new_displayed = !displayed;
    setCookie("settings_button_displayed", new_displayed.toString(), "Fri, 31 Dec 9999 23:59:59 GMT");
    set_settings_button_visibility(new_displayed);
}
