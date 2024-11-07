function notificationPermissionGranted(){
    return (Notification.permission=="granted");
}
function sendNotification__(title,content,icon){
    if(notificationPermissionGranted()){
        let notification=new Notification(title,{body: content,icon: icon});
        return notification;
    }
}

//send a notification. doesn't block
function sendNotification(title,content,icon){
    console.log("notification send attempted");
    let notification=sendNotification__(title,content,icon);
    if(notification)return notification;
    const checkLoop = setInterval(()=>{
        notification=sendNotification__(title,content,icon);
        if(notification){
            clearInterval(checkLoop);
            return notification;
        }
    },500);
}
