function toggleNavigation(){
  setTimeout(()=>{
    let link=document.getElementById('navbarDropdownMenuLink');
    // toggle show
    // HACK: add a second class to prevent bootstrap from tampering with our system
    if (link.classList.contains('secret-show')){
      link.classList.remove('show');
      link.classList.remove('secret-show');
    } else {
      link.classList.add('show');
      link.classList.add('secret-show');
    }
    let dropdown=document.getElementById('dropdown-menu');
    // toggle show
    if (dropdown.classList.contains('show')){
      dropdown.classList.remove('show');
    } else {
      dropdown.classList.add('show');
    }
    // toggle data-bs-popper
    if (dropdown.getAttribute("data-bs-popper")){
      dropdown.removeAttribute("data-bs-popper");
    } else {
      dropdown.setAttribute("data-bs-popper","static");
    }
  },0);
}

function showNavigation(){
  let link=document.getElementById('navbarDropdownMenuLink');
  // add show
  link.classList.add('show');
  link.classList.add('secret-show');
  let dropdown=document.getElementById('dropdown-menu');
  dropdown.classList.add('show');
  dropdown.setAttribute("data-bs-popper","static");
}