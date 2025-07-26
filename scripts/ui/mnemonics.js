window.addEventListener("keyup", (event) => {
    if(!KeyboardUtilities.isMnemonicBasePressed(event)){
        Array.from(document.getElementsByClassName("mnemonic")).forEach((element)=>{
            element.style.textDecoration="none";
        });   
    }
});

window.addEventListener("keydown",(event) =>{
    if(KeyboardUtilities.isMnemonicBasePressed(event)){
        Array.from(document.getElementsByClassName("mnemonic")).forEach((element)=>{
            element.style.textDecoration="underline";
        });
    }
});