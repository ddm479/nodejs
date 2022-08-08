var f = function() {  // f는 함수 값
  console.log(1+1);
  console.log(1+2);
}

console.log(f);
f();

var a = [f];  // 배열에 함수를 저장하고 사용
a[0]();

// 객체에 함수를 저장하고 사용
var o = {
  func:f
}
o.func();
