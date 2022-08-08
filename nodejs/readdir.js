var testFolder = './data'; //  ='data',   ./ 는 현재 디텍토리를 의미
// 파일이 있는 위치가 아니라 실행하는 위치에 기준

var fs = require('fs');

// 특정 디렉토리에 있는 파일 목록 알아내기
fs.readdir(testFolder, function(error, filelist){
  console.log(filelist); // 배열의 형태로 나옴
})
