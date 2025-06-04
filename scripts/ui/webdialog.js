function showDialog_(html,title,buttons){
    //create the dialog box
    const dialog = document.createElement('div');
    dialog.classList.add('dialog');
    dialog.classList.add("usedark");

    //place the text in the box
    dialog.innerHTML=html?html:"";

    //create the cover board to prevent clicking outside the winner box while it is open
    const coverBoard = document.createElement('div');
    coverBoard.classList.add('dialog-modal-coverboard');

    //create the close button
    const closeButton = document.createElement('button');
    closeButton.classList.add("nodark");
    closeButton.classList.add("dialog-close");
    const x = document.createElement('p');
    x.classList.add("dialog-xbutton");
    x.innerHTML="x";
    closeButton.appendChild(x);
    let overflow_prev=document.body.style.overflow;
    function close_dialog(){
        document.body.removeChild(dialog);
        document.body.removeChild(coverBoard);
        document.body.style.overflow=overflow_prev;
    }
    closeButton.addEventListener('click',close_dialog);

    //create the dialog title
    const dialogTitle=document.createElement("h3");
    dialogTitle.innerText=(typeof title == "string")?title:"[In-page dialog]";
    dialogTitle.classList.add("dialog-title");

    //create the button box
    let buttonBox=document.createElement("div");
    buttonBox.classList.add("dialog-buttonbox");
    buttonBox.classList.add("nodark");
    if(typeof buttons!="object"){
        buttons=[{"text":"OK","action":"close_dialog"}];
    }
    buttons.forEach(button_descriptor => {
        let button=document.createElement("button");
        button.classList.add("dialog-button");
        button.innerHTML=button_descriptor["text"];
        let action=button_descriptor["action"];
        if (typeof action!="function"){
            action=()=>true;
        }
        button.addEventListener("click",(e)=>{
            close_dialog();
            action(e);
        });
        buttonBox.appendChild(button);
    });

    //add the elements
    dialog.appendChild(buttonBox);
    dialog.appendChild(closeButton);
    dialog.appendChild(dialogTitle);
    document.body.appendChild(coverBoard);
    document.body.appendChild(dialog);
    document.body.style.overflow="hidden";
}

function showDialog(html,title,buttons){
    //ensure security
    let cleanHTML=DOMPurify.sanitize(html,{
        ALLOWED_TAGS:['h1', 'h2', 'h3', 'h4', 'h5', 'h6','p','b','i','em','strong','br','img'],
        ALLOWED_ATTR:['src','id','class','style']
    });
    let tempDiv=document.createElement("div");
    tempDiv.innerHTML=cleanHTML;
    Array.from(tempDiv.querySelectorAll('*')).forEach((elem)=>{
        if(elem.tagName.toLowerCase()!=="img"){
            elem.removeAttribute('src');
        }
    });
    cleanHTML=tempDiv.innerHTML;
    showDialog_(cleanHTML,title,buttons);
}