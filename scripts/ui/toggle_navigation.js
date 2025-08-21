document.addEventListener("keydown",(event)=>{
  if(event.key === "Escape"){
    let link=document.getElementById('navbarDropdownMenuLink');
    let dropdown=bootstrap.Dropdown.getOrCreateInstance(link);
    if(dropdown._isShown()){
      dropdown.hide();
    }
  }
});

let NavigationManager={
  toggleNavigation: function(event){
    event.stopPropagation();
    setTimeout(()=>{
      let link=document.getElementById('navbarDropdownMenuLink');
      let dropdown=bootstrap.Dropdown.getOrCreateInstance(link);
      dropdown.toggle();
    },0);
  },
  showNavigation: function(){
    let link=document.getElementById('navbarDropdownMenuLink');
    bootstrap.Dropdown.getOrCreateInstance(link).show();
  }
}