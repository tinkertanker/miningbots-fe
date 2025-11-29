let navigation_link_,navigation_dropdown_;
document.addEventListener("DOMContentLoaded", (_e) => {
  navigation_link_ = document.getElementById('navbarDropdownMenuLink');
  navigation_dropdown_ = bootstrap.Dropdown.getOrCreateInstance(navigation_link_);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (navigation_link_.classList.contains('show')) {
      navigation_dropdown_.hide();
      return;
    }
    let navbar = document.getElementById("navbar");
    if(ModeManager.IS_PRODUCTION_MODE &&
       navbar.matches(":focus-within")
    )
      document.activeElement.blur(); // the active element must be in the navbar
  }
});

let NavigationManager = {
  toggleNavigation: function () {
    setTimeout(()=>{navigation_dropdown_.toggle()}, 0);
  },
  isNavigationExpanded:function(){
    return navigation_link_.classList.contains('show');
  },
  showNavigation: function () {
    navigation_dropdown_.show();
  }
}