ModeManager.IS_PRODUCTION_MODE=false;
document.addEventListener("DOMContentLoaded",(_e)=>{
    ModeManager.IS_PRODUCTION_MODE = false;
    ModeManager.is_production().then((production_mode) => {
      ModeManager.IS_PRODUCTION_MODE = production_mode;
    });
    setTimeout(() => {
      if (ModeManager.IS_PRODUCTION_MODE) {
        let navbar=document.getElementById("navbar")
        navbar.classList.add("production-hidden");
        let dropdown=document.getElementById("navbarDropdownMenuLink");
        dropdown.addEventListener("shown.bs.dropdown",()=>{
            navbar.classList.remove("production-hidden");
        });
        dropdown.addEventListener("hidden.bs.dropdown",()=>{
            navbar.classList.add("production-hidden"); // put the class back
        });
        let triggerbox=document.getElementById("navbar-peek-triggerbox");
        triggerbox.addEventListener("mouseenter",()=>{
            navbar.classList.remove("production-hidden");
        });
        triggerbox.addEventListener("mouseleave",()=>{
            navbar.classList.add("production-hidden"); // put the class back
        });
      }
    }, 400);
});