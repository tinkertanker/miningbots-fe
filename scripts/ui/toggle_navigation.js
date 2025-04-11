function toggleNavigation(){
    let link=document.getElementById('navbarDropdownMenuLink');
    // toggle show
    if (link.classList.contains('show')){
      link.classList.remove('show');
    } else {
      link.classList.add('show');
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
}