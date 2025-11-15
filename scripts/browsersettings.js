async function read_default_config_file_() {
    var file_content = `UI_MODE=debug`;
    await fetch("/browsersettings.conf.example").then(async (response) => {
        //If the status is not "good", do not process the body
        if (!response.ok) return;
        //Here, the status must be "good"
        file_content = ""; // Empty the file content. (Prevent the default value from being prepended)
        let reader_out = await response.body.getReader().read();
        Array.from(reader_out.value).forEach((value) => {
            file_content += String.fromCharCode(value);
        });
    });
    return file_content;
}


function read_config_file_() {
    return atob(decodeURIComponent(URLArguments["config"] || ""));
}

function assemble_config_file_(file_content, default_file_content) {
    var default_entries = parse_config_file_(default_file_content);
    var file_entries = parse_config_file_(file_content);
    //Override default entries with file entries
    let target=Object.assign({},default_entries);
    return Object.assign(target, file_entries);
}
function parse_config_file_(file_content) {
    var entries = {};
    var file_lines = file_content.split(/\r?\n|\r|\n/g); // split the lines (https://stackoverflow.com/a/21712066)
    file_lines.forEach((line) => {
        line = line.trim();
        if (line.charAt(0) == "#") return; // ignore comments
        if (line.length == 0) return; // ignore empty lines
        config_entry = line.split('=');
        name = config_entry[0]; value = config_entry[1];
        entries[name] = value;
    });
    return entries;
}

async function is_production_() {
    let config_file = assemble_config_file_(read_config_file_(),await read_default_config_file_());
    return config_file["UI_MODE"] == "fullscreen"; // MiningBots is deployed in full screen, hence full screen = production
}

const ModeManager = {
    is_production: is_production_
}