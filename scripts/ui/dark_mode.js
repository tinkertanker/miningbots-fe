const DM_DEVICE=window.matchMedia('(prefers-color-scheme: dark)');
let DM_ENABLED=false;
function darkModeEnabled(settings){
    switch (settings["theme"]){
        case "dark":
            return true;
        case "light":
            return false;
        case "auto":
            return DM_DEVICE.matches;
        default:
            return DM_DEVICE.matches;
    }
}
function setDarkMode(enabled){
    if(enabled==DM_ENABLED)return;
    if(enabled){
        document.head.innerHTML+="<link href=\"/styles/dark-mode-patch.css\" rel=\"stylesheet\" id=\"set-dark-mode\">";
    } else {
        document.head.removeChild(document.getElementById("set-dark-mode"));
    }
    DM_ENABLED=enabled;
}
function pairDarkMode(settings){
    DM_DEVICE.addEventListener("change",(e)=>{
        setDarkMode(darkModeEnabled(settings));
    })
}