function show_help() {
    showDialog(
        `Keyboard shortcuts:<br>
        <br>
        ${KeyboardUtilities.joinMnemonic('E')}: Open Settings panel<br>
        ${KeyboardUtilities.joinMnemonic('H')}: Open this help`
    ,"Help");
}

function show_settings_help() {
    showDialog(
        `Keyboard shortcuts:<br>
        <br>
        ${KeyboardUtilities.joinMnemonic('O')}: Save settings, reload main page, and close this window<br>
        ${KeyboardUtilities.joinMnemonic('C')}: Close this window without saving the settings<br>
        ${KeyboardUtilities.joinMnemonic('A')}: Save settings and reload main page<br>
        ${KeyboardUtilities.joinMnemonic('S')}: Export settings to settings.json<br>
        ${KeyboardUtilities.joinMnemonic('I')}: Load settings from a JSON file<br>
        ${KeyboardUtilities.joinMnemonic('H')}: Show this help<br>`
    ,"Help");
}