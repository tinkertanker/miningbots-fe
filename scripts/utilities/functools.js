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

function object_map(object,f){
    let array=[];
    object_forEach(object,(key,value)=>{
        array.push(f(key,value));
    });
    return array;
}

function object_map_values(object,f){
    let target=Object.assign({},object);
    object_forEach(object,(key,value)=>{
        target[key]=f(key,value);
    });
    return target;
}
