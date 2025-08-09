function show_help() {
    if(isAnotherDialogShowing()) return; // Prevent showing another dialog if one is already open
    showDialog(
        `<span style="white-space:nowrap;"><svgfile src="/images/ui/help.svg"></svgfile> (Help): Open this help<br>
        <svgfile src="/images/ui/settings.svg"></svgfile> (Settings): Open Settings panel<br></span>`
    ,"Help");
}

function show_settings_help() {
    if(isAnotherDialogShowing()) return; // Prevent showing another dialog if one is already open
    showDialog(
        `<span style="white-space:nowrap;"><svgfile src="/images/ui/ok.svg"></svgfile> (OK): Save settings, reload main page, and close this window<br>
        <svgfile src="/images/ui/cancel.svg"></svgfile> (Cancel): Close this window without saving the settings<br>
        <svgfile src="/images/ui/apply.svg"></svgfile> (Apply): Save settings and reload main page<br>
        <svgfile src="/images/ui/export.svg"></svgfile> (Export): Export settings to settings.json<br>
        <svgfile src="/images/ui/import.svg"></svgfile> (Import): Load settings from a JSON file<br>
        <svgfile src="/images/ui/help.svg"></svgfile> (Help): Show this help<br></span>`
    ,"Help");
}