import { KeyboardUtilities } from "/scripts/utilities/keyboard_utilities.js";
import { DialogUtilities } from "/scripts/ui/webdialog.js";

let HelpManager = {
    show_help: function() {
        if (DialogUtilities.isAnotherDialogShowing()) return; // Prevent showing another dialog if one is already open
        let content="<span style=\"white-space:nowrap;\">";
        document.querySelectorAll('#accessibility-labels *').forEach(el => {
            if(el.id.endsWith("-help") && !el.hasAttribute("helpon-only")){ // only include non-helpon-only elements
                content+=el.outerHTML.replace("noimport","")+'<br>'; // remove noimport from svgfile elements (to ensure they are loaded)
            }
        });
        content+="</span>";
        DialogUtilities.showDialog(
            content, "Help", undefined, undefined, "OK");
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

let isHelponActive = false; // Track the current helpon mode
HelpManager.activate_helpon = function() {
    if(DialogUtilities.isAnotherDialogShowing()) return; // Prevent showing another dialog if one is already open
    isHelponActive = true;
    onHelponActivated_();
}


document.addEventListener("keydown", (event) => {
    if (isHelponActive) {
        event.stopPropagation();
        if (event.key == "Escape") {
            isHelponActive = false; // Exit helpon mode
            onHelponDeactivated_();
        }
    }
});

document.addEventListener("click", (event) => {
    if (isHelponActive) {
        event.stopPropagation();
        event.preventDefault();
        console.log("launching help dialog");
        let target = event.target.closest("[helpon-available]"); // Get the closest element with an ID
        if (target) {
            let name = document.querySelector(`#accessibility-labels #${target.id}-label`).textContent || target.id; // Get from accessibility-labels, otherwise use ID
            let helpText = document.querySelector(`#accessibility-labels #${target.id}-help`).innerHTML.replace("noimport", ""); // Get help text from accessibility-labels, removing noimport from svgfile elements (to ensure they are loaded)
            if (helpText) {
                isHelponActive = false; // Exit helpon mode
                onHelponDeactivated_();
                DialogUtilities.showDialog(helpText, `Help on "${name}"`, undefined, undefined, "OK"); // undefined means default buttons
            }
        }
    }
},{capture: true}); // Use capture phase to ensure it catches the event before other handlers
let hasHelp=document.getElementById("help");
let hasHelpOn=document.getElementById("help-on");

document.addEventListener("keydown", (event) => {
    if (KeyboardUtilities.isMnemonicPressed(event,true,'h') && hasHelpOn) {
        HelpManager.activate_helpon();
        event.preventDefault();
    } else if (KeyboardUtilities.isMnemonicPressed(event,false,'h') && hasHelp) {
        HelpManager.show_help();
        event.preventDefault();
    }
});

window.HelpManager=HelpManager; // make globally accessible
export { HelpManager };