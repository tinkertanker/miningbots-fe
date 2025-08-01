function show_help() {
    updateHelpIcon("normal");
    setTimeout(alert,200,
        `Keyboard shortcuts:

        ${KeyboardUtilities.joinMnemonic('E')}: Open Settings panel
        ${KeyboardUtilities.joinMnemonic('H')}: Open this help`
    );
}

function show_settings_help() {
    updateHelpIcon("normal");
    setTimeout(alert,200,
        `Keyboard shortcuts:

        ${KeyboardUtilities.joinMnemonic('O')}: Save settings, reload main page, and close this window
        ${KeyboardUtilities.joinMnemonic('C')}: Close this window without saving the settings
        ${KeyboardUtilities.joinMnemonic('A')}: Save settings and reload main page
        ${KeyboardUtilities.joinMnemonic('H')}: Show this help`
    );
}

let updateHelpIcon;

document.addEventListener("DOMContentLoaded",(_e) => {
    const helpIcon = document.getElementById("help-icon");
    updateHelpIcon=function(newState){
        if(!helpIcon) return;
        switch(newState){
            case "rollover":
                newImage = "/images/ui/helprollover.png";
                break;
            case "hover":
                newImage = "/images/ui/helphover.png";
                break;
            case "normal":
            default:
                newImage = "/images/ui/help.png";
        }
        helpIcon.src = newImage;
    }

    helpIcon.title+=` (${KeyboardUtilities.joinMnemonic('H')})`;

    const helpButton = document.getElementById("help");
    if(!helpButton) return;
    helpButton.addEventListener("mouseenter", () => {updateHelpIcon("hover")});
    helpButton.addEventListener("mouseleave", () => {updateHelpIcon("normal")});
    helpButton.addEventListener("mousedown", () => {updateHelpIcon("rollover")});
    helpButton.addEventListener("mouseup", () => {updateHelpIcon("hover")});
});