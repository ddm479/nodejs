var fs = require('fs'); //  파일시스템 모듈 사용가능 하게됨
fs.readFile('sample.txt', 'utf8', function(err, data){
  console.log(data); // 특정 파일의 내용 가져오기
});
