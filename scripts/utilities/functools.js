function map(array,f) {
    let output=[];
    array.forEach(element => {
        output.push(f(element));
    });
    return output;
}

function object_forEach(object,f){
    Object.keys(object).forEach((key)=>{
        f(key,object[key]);
    });
}