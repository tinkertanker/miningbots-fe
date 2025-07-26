let KeyboardUtilities = {
    isMac : navigator.userAgent.includes("Macintosh")
}

KeyboardUtilities.isPrimaryPressed=function (event){
    return (KeyboardUtilities.isMac ? event.metaKey:event.ctrlKey);
}

KeyboardUtilities.joinKeys = function(...keys) {
    output = "";
    if(KeyboardUtilities.isMac){
        Array.from(keys).forEach((key) => {
            output += key.replace("Primary", "⌘").replace("Alt", "⌥");
        });
    } else {
        let ported_keys = map(keys, (key) => {
            if(key === "Primary") return "Ctrl";
            if(key === "Alt") return "Alt";
            return key;
        });
        output = ported_keys.join(" + ");
    }
    return output;
}