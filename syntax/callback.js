/*
function a(){
  console.log('A');
}
*/
var a = function(){  // a는 함수 값
  console.log('A');
}


function slowfunc(callback){
  callback();
}

slowfunc(a);
