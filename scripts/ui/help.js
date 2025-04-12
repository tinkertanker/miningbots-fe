function show_help() {
    document.getElementById("help-icon").src="/images/help.png";
    setTimeout(alert,200,
        `Keyboard shortcuts:

        Control-Alt-C: Open Settings panel
        Control-H:     Open this help`
    );
}