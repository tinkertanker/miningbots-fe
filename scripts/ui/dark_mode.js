const DM_DEVICE_=window.matchMedia('(prefers-color-scheme: dark)');
let DM_ENABLED_=false;
let DarkModeManager={};
DarkModeManager.darkModeEnabled=function(settings){
    switch (settings["theme"]){
        case "dark":
            return true;
        case "light":
            return false;
        default:
            return DM_DEVICE_.matches;
    }
}
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