const LB_LOADING_COMPLETED = 0;
const LB_SERVER_NO_SELECTION = 4;
const LB_LOADING = 1;
const LB_SERVER_UNAVAILABLE = 2;
const LB_NO_INTERNET = 3;
const LB_NO_GAME = 5;
let LB_OBJECT = null;
document.addEventListener("DOMContentLoaded",()=>{
    LB_OBJECT = document.getElementById("loadingbox");
});
function setLoadingBoxStatus_(status) {
    switch (status) {
        case LB_LOADING_COMPLETED:
        case LB_SERVER_NO_SELECTION:
            LB_OBJECT.classList.add("loading-completed");
            LB_OBJECT.innerHTML="";
            break;

        case LB_LOADING:
            LB_OBJECT.innerHTML = "Please wait while we connect to the selected server";
            break;

        case LB_NO_GAME:
            LB_OBJECT.innerHTML = "No active games are available on the server";
            LB_OBJECT.classList.remove("loading-completed");
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

function setLoadingBoxStatus(status) {
    if(LB_OBJECT){
        setLoadingBoxStatus_(status);
    } else {
        document.addEventListener("DOMContentLoaded",()=>{
            setLoadingBoxStatus_(status);
        });
    }
}