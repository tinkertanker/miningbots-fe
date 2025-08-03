function toggleNavigation(){
  setTimeout(()=>{
    let link=document.getElementById('navbarDropdownMenuLink');
    let dropdown=bootstrap.Dropdown.getOrCreateInstance(link);
    if(link.classList.contains('secret-show')){
      dropdown.hide();
      link.classList.remove('secret-show');
    }else{
      dropdown.show();
      link.classList.add('secret-show');
    }
  },0);
}

function showNavigation(){
  let link=document.getElementById('navbarDropdownMenuLink');
  bootstrap.Dropdown.getOrCreateInstance(link).show();
}
 