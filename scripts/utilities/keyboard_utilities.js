let KeyboardUtilities = {
    isMac : navigator.userAgent.includes("Macintosh")
}

KeyboardUtilities.isPrimaryPressed=function (event){
    return (KeyboardUtilities.isMac ? event.metaKey:event.ctrlKey);
}

KeyboardUtilities.isMnemonicBasePressed = function(event) {
    if (KeyboardUtilities.isMac) {
        return KeyboardUtilities.isPrimaryPressed(event) && event.shiftKey;
    } else {
        return KeyboardUtilities.isPrimaryPressed(event) && event.altKey;
    }
}

KeyboardUtilities.isMnemonicPressed = function(event, letter) {
    return KeyboardUtilities.isMnemonicBasePressed(event) && event.key.toLowerCase() === letter.toLowerCase();
}

KeyboardUtilities.joinKeys = function(...keys) {
    output = "";
    if(KeyboardUtilities.isMac){
        Array.from(keys).forEach((key) => {
            output += key.replace("Primary", "⌘").replace("Alt", "⌥").replace("Shift", "⇧");
        });
    } else {
        let ported_keys = map(keys, (key) => {
            if(key === "Primary") return "Ctrl";
            return key;
        });
        output = ported_keys.join(" + ");
    }
    return output;
}

KeyboardUtilities.joinMnemonic = function(letter) {
    return KeyboardUtilities.isMac?KeyboardUtilities.joinKeys('Primary', 'Shift', letter):KeyboardUtilities.joinKeys('Primary','Alt',letter);
}

function setTabIndices() {
    document.querySelectorAll("a[role='button']").forEach((button) => {
        button.setAttribute('tabindex', '0');
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent scrolling on Space
                button.click();     // Simulate click
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", (_e) => {
    setTabIndices();
});