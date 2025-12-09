let ModeManager = {
  IS_PRODUCTION_MODE: false,
};
function isFullscreen_() {
  return window.innerWidth>=screen.availWidth &&
          window.innerHeight>=screen.availHeight;
}

if(isFullscreen_()){
  ModeManager.IS_PRODUCTION_MODE = true;
  let navbar=document.getElementById("navbar");
  navbar.classList.add("production-hidden");
}

export { ModeManager };