function toggleNavigation(event){
  event.stopPropagation();
  setTimeout(()=>{
    let link=document.getElementById('navbarDropdownMenuLink');
    let dropdown=bootstrap.Dropdown.getOrCreateInstance(link);
    menu=document.getElementById('dropdown-menu');
    if(menu.classList.contains('show')){
      dropdown.hide();
    }else{
      dropdown.show();
    }
  },0);
}

function showNavigation(){
  let link=document.getElementById('navbarDropdownMenuLink');
  bootstrap.Dropdown.getOrCreateInstance(link).show();
}
 