ModeManager.IS_PRODUCTION_MODE=false;
document.addEventListener("DOMContentLoaded",(_e)=>{
    ModeManager.IS_PRODUCTION_MODE = false;
    ModeManager.is_production().then((production_mode) => {
      ModeManager.IS_PRODUCTION_MODE = production_mode;
    });
    setTimeout(() => {
      SettingsManager.initialize_main(ModeManager.IS_PRODUCTION_MODE);
      if (ModeManager.IS_PRODUCTION_MODE) {
        document.getElementById("navbar").classList.add("production-hidden");
      }
    }, 400);
});