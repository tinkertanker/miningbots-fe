let NotificationUtilities = {
    notificationPermissionGranted: function() {
        return (Notification.permission == "granted");
    },
    askForNotificationPermission: Notification.requestPermission,
}

function sendNotification_(title, content, icon) {
    if (NotficationUtilities.notificationPermissionGranted()) {
        let notification = new Notification(title, { body: content, icon: icon });
        return notification;
    }
}

//send a notification. doesn't block
NotificationUtilities.sendNotification=function(title, content, icon) {
    console.log("notification send attempted");
    let notification = sendNotification_(title, content, icon);
    if (notification) return notification;
    const checkLoop = setInterval(() => {
        notification = sendNotification_(title, content, icon);
        if (notification) {
            clearInterval(checkLoop);
            return notification;
        }
    }, 500);
}