import { SettingsManager } from "/scripts/settings.js";
const DM_DEVICE_=window.matchMedia('(prefers-color-scheme: dark)');
let DM_ENABLED_=false;
let darkModeSwitchListeners_=[];
let DarkModeManager={
    isDarkMode: function(){
        return DM_ENABLED_;
    },
    darkModeEnabled: function(theme){
        switch (theme){
            case "dark":
                return true;
            case "light":
                return false;
            default:
                return DM_DEVICE_.matches;
        }
    },
    addDarkModeListener: function(target,event,listener){
        if(!darkModeSwitchListeners_.includes(target))
            darkModeSwitchListeners_.push(target);
        target.addEventListener(event,listener);
    }
};
DarkModeManager.setDarkMode=function(enabled,is_setup_call){
    if(enabled==DM_ENABLED_)return;
    if(enabled)
        document.body.classList.add("dark-mode");
    else 
        document.body.classList.remove("dark-mode");
    DM_ENABLED_=enabled;
    if(!is_setup_call)
        darkModeSwitchListeners_.forEach((target)=>{
            target.dispatchEvent(new Event("dm."+(enabled?"enabled":"disabled")))
        });
}
DarkModeManager.pairDarkMode=function (settings){
    DM_DEVICE_.addEventListener("change",(e)=>{
        DarkModeManager.setDarkMode(DarkModeManager.darkModeEnabled(settings['theme']));
    });
}

export { DarkModeManager };

document.addEventListener("DOMContentLoaded",()=>{
    let interval=-1;
    function setup(){
        if(!SettingsManager)return;
        let CONFIG_ = SettingsManager.read_settings_cookie();

        // set dark mode
        DarkModeManager.pairDarkMode(CONFIG_);
        DarkModeManager.setDarkMode(DarkModeManager.darkModeEnabled(CONFIG_['theme']),true);
        if(interval!=-1)clearInterval(interval);
    }
    interval=setInterval(setup,100);
    setup();
});