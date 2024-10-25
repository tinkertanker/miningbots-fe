async function read_config_file() {
    var file_content = `UI_MODE=debug`;
    await fetch("/browsersettings.conf").then(async (response) => {
        //If the status is not "good", do not process the body
        if(!response.ok)return;
        //Here, the status must be "good"
        file_content=""; // Empty the file content. (Prevent the default value from being prepended)
        let reader_out = await response.body.getReader().read();
        Array.from(reader_out.value).forEach((value) => {
            file_content += String.fromCharCode(value);
        });
    });
    return file_content;
}

function parse_config_file(file_content){
    var entries={};
    var file_lines=file_content.split(/\r?\n|\r|\n/g); // split the lines (https://stackoverflow.com/a/21712066)
    file_lines.forEach((line)=>{
        line=line.trim();
        if(line.charAt(0)=="#")return; // ignore comments
        if(line.length==0)return; // ignore empty lines
        config_entry=line.split('=');
        name=config_entry[0];value=config_entry[1];
        entries[name]=value;
    });
    return entries;
}

async function is_production(){
    let config_file=parse_config_file(await read_config_file());
    return config_file["UI_MODE"]=="fullscreen"; // MiningBots is deployed in full screen, hence full screen = production
}