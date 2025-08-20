let HelpManager = {
    show_help: function() {
        if (DialogUtilities.isAnotherDialogShowing()) return; // Prevent showing another dialog if one is already open
        DialogUtilities.showDialog(
            `<span style="white-space:nowrap;"><svgfile src="/images/ui/help.svg"></svgfile> (Help): Open this help<br>
            <svgfile src="/images/ui/help-on.svg"></svgfile> (Help on): Get help on a specific element by clicking on it<br>
            <svgfile src="/images/ui/settings.svg"></svgfile> (Settings): Open Settings panel<br></span>`
            , "Help");
    },
    show_settings_help: function() {
        if (DialogUtilities.isAnotherDialogShowing()) return; // Prevent showing another dialog if one is already open
        DialogUtilities.showDialog(
            `<span style="white-space:nowrap;"><svgfile src="/images/ui/help.svg"></svgfile> (Help): Show this help<br>
            <svgfile src="/images/ui/help-on.svg"></svgfile> (Help on): Get help on a specific element by clicking on it<br>
            <svgfile src="/images/ui/ok.svg"></svgfile> (OK): Save settings, reload main page, and close this window<br>
            <svgfile src="/images/ui/cancel.svg"></svgfile> (Cancel): Close this window without saving the settings<br>
            <svgfile src="/images/ui/apply.svg"></svgfile> (Apply): Save settings and reload main page<br>
            <svgfile src="/images/ui/export.svg"></svgfile> (Export): Export settings to settings.json<br>
            <svgfile src="/images/ui/import.svg"></svgfile> (Import): Load settings from a JSON file<br></span>`
            , "Help");
    }
}

function disableBootstrapTogglers_() {
    document.querySelectorAll('[data-bs-toggle]').forEach(el => {
        el.setAttribute('data-bs-toggle-backup', el.getAttribute('data-bs-toggle'));
        el.removeAttribute('data-bs-toggle');
    });
}

function restoreBootstrapTogglers_() {
    document.querySelectorAll('[data-bs-toggle-backup]').forEach(el => {
        el.setAttribute('data-bs-toggle', el.getAttribute('data-bs-toggle-backup'));
        el.removeAttribute('data-bs-toggle-backup');
    });
}


function onHelponActivated_() {
    document.querySelectorAll('*').forEach((element) => {
        if(element.style){
            element.setAttribute('data-original-cursor', element.style.cursor || '');
            element.style.cursor = 'help';
        }
    });
    disableBootstrapTogglers_(); // Disable Bootstrap togglers to prevent unwanted behavior
}

function onHelponDeactivated_() {
    document.querySelectorAll('[data-original-cursor]').forEach((element) => {
        if(element.style){
            element.style.cursor = element.getAttribute('data-original-cursor');
        }
        element.removeAttribute('data-original-cursor');
    });
    restoreBootstrapTogglers_(); // Restore Bootstrap togglers
}

let currentHelponMode_ = null; // Track the current helpon mode
HelpManager.activate_helpon = function() {
    if(DialogUtilities.isAnotherDialogShowing()) return; // Prevent showing another dialog if one is already open
    currentHelponMode_ = "main";
    onHelponActivated_();
}

HelpManager.activate_helpon_settings=function() {
    if(DialogUtilities.isAnotherDialogShowing()) return; // Prevent showing another dialog if one is already open
    currentHelponMode_ = "settings";
    onHelponActivated_();
}

document.addEventListener("keydown", (event) => {
    if (currentHelponMode_ != null) {
        event.stopPropagation();
        if (event.key == "Escape") {
            currentHelponMode_ = null; // Exit helpon mode
            onHelponDeactivated_();
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
        if (currentHelponMode_ != null) {
            event.stopPropagation();
            event.preventDefault();
            console.log("launching help dialog");
            let target = event.target.closest("[id]"); // Get the closest element with an ID
            if (target) {
                let name = document.querySelector(`#accessibility-labels #${target.id}-label`).textContent || target.id; // Get from accessibility-labels, otherwise use ID
                let helpText = document.querySelector(`#accessibility-labels #${target.id}-help`).innerHTML.replace("noimport", ""); // Get help text from accessibility-labels, removing noimport
                if (helpText) {
                    currentHelponMode_ = null; // Exit helpon mode
                    onHelponDeactivated_();
                    DialogUtilities.showDialog(helpText, `Help on "${name}"`);
                }
            }
        }
    },{capture: true}); // Use capture phase to ensure it catches the event before other handlers
});