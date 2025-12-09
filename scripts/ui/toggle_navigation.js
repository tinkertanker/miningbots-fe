import { ModeManager } from "/scripts/ui/hide_navbar.js";

let navigation_link_ = document.getElementById('navbarDropdownMenuLink');
let navigation_dropdown_ = bootstrap.Dropdown.getOrCreateInstance(navigation_link_);

let NavigationManager = {
  toggleNavigation: function () {
    setTimeout(()=>{navigation_dropdown_.toggle()}, 0);
  },
  isNavigationExpanded:function(){
    return navigation_link_.classList.contains('show');
  },
  hideNavigation: function () {
    navigation_dropdown_.hide();
  },
  showNavigation: function () {
    navigation_dropdown_.show();
  }
}

window.NavigationManager = NavigationManager; // make globally accessible
export { NavigationManager };

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (NavigationManager.isNavigationExpanded()) {
      NavigationManager.hideNavigation();
      return;
    }
    let navbar = document.getElementById("navbar");
    if(ModeManager.IS_PRODUCTION_MODE &&
       navbar.matches(":focus-within")
    )
      document.activeElement.blur(); // the active element must be in the navbar
  }
});