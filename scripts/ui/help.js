function show_help() {
    document.getElementById("help-icon").src="/images/ui/help.png";
    setTimeout(alert,200,
        `Keyboard shortcuts:

        ${primaryKey}-E: Open Settings panel
        ${primaryKey}-H:     Open this help`
    );
}

function show_settings_help() {
    document.getElementById("help-icon").src="/images/ui/help.png";
    setTimeout(alert,200,
        `Keyboard shortcuts:

        ${primaryKey}-O: Save settings, reload main page, and close this window
        ${primaryKey}-C: Close this window without saving the settings
        ${primaryKey}-A: Save settings and reload main page`
    );
}