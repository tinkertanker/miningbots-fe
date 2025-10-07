let navigation_link_,navigation_dropdown_;
document.addEventListener("DOMContentLoaded", (_e) => {
  navigation_link_ = document.getElementById('navbarDropdownMenuLink');
  navigation_dropdown_ = bootstrap.Dropdown.getOrCreateInstance(navigation_link_);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (navigation_dropdown_._isShown()) {
      navigation_dropdown_.hide();
    }
  }
});

let NavigationManager = {
  toggleNavigation: function (event) {
    event.stopPropagation();
    setTimeout(()=>{navigation_dropdown_.toggle()}, 0);
  },
  showNavigation: function () {
    navigation_dropdown_.show();
  }
}