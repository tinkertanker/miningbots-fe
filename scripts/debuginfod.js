import DialogUtilities from "./ui/webdialog.js"
let DebugInfod={
    data: {},
};

DebugInfod.showDebugInfo=function(){
    let data_html="";
    let data=DebugInfod.data;
    if(data.gameId){
        data_html+=`Game Id: ${data.gameId}`
    }
    DialogUtilities.showDialog(data_html,"Debug Information");
}

window.DebugInfod=DebugInfod;
export default DebugInfod;
