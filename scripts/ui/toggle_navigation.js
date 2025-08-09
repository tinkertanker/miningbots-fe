let toggleNavigation, showNavigation;
document.addEventListener('DOMContentLoaded', () => {
  const navbarToggler = document.querySelector('.navbar-toggler');

  const buttonDropdown = new bootstrap.Dropdown(navbarToggler, {
    popperConfig: (defaultConfig) => ({
      ...defaultConfig,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }),
  });

  const defaultDropdown = bootstrap.Dropdown.getOrCreateInstance(document.getElementById('navbarDropdownMenuLink'));
  toggleNavigation = function(event) {
    event.stopPropagation();

    setTimeout(() => {
      buttonDropdown.toggle();
    }, 0);
  }

  showNavigation = function() {
    if(window.getComputedStyle(navbarToggler).display === 'none') {
      defaultDropdown.show();
    } else {
      buttonDropdown.show();
    }
  }
});