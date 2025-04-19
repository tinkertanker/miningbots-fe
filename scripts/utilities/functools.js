function map(array,f) {
    let output=[];
    array.forEach(element => {
        output.push(f(element));
    });
    return output;
}