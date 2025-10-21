const DM_DEVICE_=window.matchMedia('(prefers-color-scheme: dark)');
let DM_ENABLED_=false;
let DarkModeManager={
    isDarkMode: function(){
        return DM_ENABLED_;
    },
    darkModeEnabled: function(settings){
    switch (settings["theme"]){
        case "dark":
            return true;
        case "light":
            return false;
        default:
            return DM_DEVICE_.matches;
    }
}
};
DarkModeManager.setDarkMode=function(enabled){
    if(enabled==DM_ENABLED_)return;
    if(enabled){
        document.head.innerHTML+="<link href=\"/styles/dark-mode-patch.css\" rel=\"stylesheet\" id=\"set-dark-mode\">";
    } else {
        document.head.removeChild(document.getElementById("set-dark-mode"));
    }
    DM_ENABLED_=enabled;
}
DarkModeManager.pairDarkMode=function (settings){
    DM_DEVICE_.addEventListener("change",(e)=>{
        DarkModeManager.setDarkMode(DarkModeManager.darkModeEnabled(settings));
    });
}

document.addEventListener("DOMContentLoaded",()=>{
    let interval=-1;
    function setup(){
        if(!SettingsManager)return;
        CONFIG_ = SettingsManager.read_settings_cookie();

        // set dark mode
        DarkModeManager.pairDarkMode(CONFIG_);
        DarkModeManager.setDarkMode(DarkModeManager.darkModeEnabled(CONFIG_));
        if(interval!=-1)clearInterval(interval);
    }
    interval=setInterval(setup,100);
    setup();
});