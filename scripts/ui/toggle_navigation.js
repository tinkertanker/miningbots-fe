document.addEventListener("keydown",(event)=>{
  if(event.key === "Escape"){
    let link=document.getElementById('navbarDropdownMenuLink');
    let dropdown=bootstrap.Dropdown.getOrCreateInstance(link);
    if(dropdown._isShown()){
      dropdown.hide();
    }
  }
});

function toggleNavigation(event){
  event.stopPropagation();
  setTimeout(()=>{
    let link=document.getElementById('navbarDropdownMenuLink');
    let dropdown=bootstrap.Dropdown.getOrCreateInstance(link);
    dropdown.toggle();
  },0);
}

function showNavigation(){
  let link=document.getElementById('navbarDropdownMenuLink');
  bootstrap.Dropdown.getOrCreateInstance(link).show();
}