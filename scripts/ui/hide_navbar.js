let ModeManager = {
  IS_PRODUCTION_MODE: false,
};
function isFullscreen_() {
  return window.innerWidth>=screen.availWidth &&
          window.innerHeight>=screen.availHeight;
}
document.addEventListener("DOMContentLoaded",(_e)=>{
    if(isFullscreen_())
      ModeManager.IS_PRODUCTION_MODE = true;
    setTimeout(() => {
      if (ModeManager.IS_PRODUCTION_MODE) {
        let navbar=document.getElementById("navbar");
        navbar.classList.add("production-hidden");
      }
    }, 400);
});