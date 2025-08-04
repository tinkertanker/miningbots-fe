function show_help() {
    setTimeout(alert,200,
        `Keyboard shortcuts:

        ${KeyboardUtilities.joinMnemonic('E')}: Open Settings panel
        ${KeyboardUtilities.joinMnemonic('H')}: Open this help`
    );
}

function show_settings_help() {
    setTimeout(alert,200,
        `Keyboard shortcuts:

        ${KeyboardUtilities.joinMnemonic('O')}: Save settings, reload main page, and close this window
        ${KeyboardUtilities.joinMnemonic('C')}: Close this window without saving the settings
        ${KeyboardUtilities.joinMnemonic('A')}: Save settings and reload main page
        ${KeyboardUtilities.joinMnemonic('S')}: Export settings to settings.json
        ${KeyboardUtilities.joinMnemonic('I')}: Load settings from a JSON file
        ${KeyboardUtilities.joinMnemonic('H')}: Show this help`
    );
}