const LB_LOADING_COMPLETED = 0
const LB_SERVER_NO_SELECTION = 4;
const LB_LOADING = 1
const LB_SERVER_UNAVAILABLE = 2
const LB_NO_INTERNET = 3
let LB_OBJECT = null;
function initializeLoadingBox() {
    LB_OBJECT = document.querySelector(".loadingbox");
}
function setLoadingBoxStatus(status) {
    switch (status) {
        case LB_LOADING_COMPLETED:
        case LB_SERVER_NO_SELECTION:
            LB_OBJECT.classList.add("loading-completed");
            LB_OBJECT.innerHTML="";
            break;

        case LB_LOADING:
            LB_OBJECT.innerHTML = "Please wait while we connect to the selected server";
            break;

        case LB_SERVER_UNAVAILABLE:
            LB_OBJECT.innerHTML = "Please select another server from the Server Selector";
            break;

        case LB_NO_INTERNET:
            LB_OBJECT.innerHTML = "Please connect to the Internet";
        

        default:
            break;
    }
}
