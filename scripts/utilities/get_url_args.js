let URLArguments={};
if (location.href.indexOf('?')!==-1){
    const queryString=location.href.split('?')[1];
    const urlParams=new URLSearchParams(queryString);
    for (const [key,value] of urlParams.entries()){
        URLArguments[key]=value;
    }
}