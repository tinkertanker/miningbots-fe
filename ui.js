function show_help() {
    document.getElementById("help-icon").src="assets/help.png";
    setTimeout(alert,200,
        `Keyboard shortcuts:
            
        Control-Alt-D: Show/Hide Settings button
        Control-Alt-C: Open Settings panel
        Control-H:     Open this help`
    );
}