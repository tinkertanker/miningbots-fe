var PRODUCTION_MODE=false;
document.addEventListener("DOMContentLoaded",(_e)=>{
    PRODUCTION_MODE = false;
    is_production().then((production_mode) => {
      PRODUCTION_MODE = production_mode;
    });
    setTimeout(() => {
      initialize_main(PRODUCTION_MODE);
      if (PRODUCTION_MODE) {
        document.getElementById("navbar").classList.add("production-hidden");
      }
    }, 400);
});