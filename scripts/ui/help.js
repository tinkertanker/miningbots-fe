function show_help() {
    document.getElementById("help-icon").src="/images/ui/help.png";
    setTimeout(alert,200,
        `Keyboard shortcuts:

        ${primaryKey}-E: Open Settings panel
        ${primaryKey}-H:     Open this help`
    );
}