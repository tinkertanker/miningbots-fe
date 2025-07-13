const isMac = navigator.userAgent.includes("Macintosh");
const primaryKey=isMac ? "Command":"Control";

function isPrimaryPressed(event){
    return (isMac ? event.metaKey:event.ctrlKey);
}