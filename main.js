var http = require('http');
var fs = require('fs');
var url = require('url'); // url이라는 모듈을 사용할 것을 nodsjs에게 알려줌
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var template = require('./lib/template.js'); // 모듈 사용하기

// request는 우리가 요청할 때 웹 브라우저가 보낸 정보, response는 응답할 때 우리가       웹 브라우저에게 전송할 정보
var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query; // 객체형태, parse는 분석하다 의미
  var pathname = url.parse(_url, true).pathname;

  console.log(url.parse(_url, true));

  // if(_url == '/'){   // 최상위 root로 접속
  //   title = 'Welcome';
  // }
  // if(_url == '/favicon.ico'){
  //   return response.writeHead(404);
  // }

  if (pathname === '/') {
    if (queryData.id === undefined) { // 홈으로 간 경우, undefined는 정의되지 않은, 없는 값을 호출하려고 했을 때를 undefined라 부름
      fs.readdir('./data', function(error, filelist) { // 파일 목록 알아내기
        console.log(filelist); // 배열의 형태로 나옴
        var title = 'Welcome';
        var description = 'Hello, Node.js';

        var list = template.list(filelist);
        var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        ); // 홈은 업데이트,삭제 부분이 없음
        response.writeHead(200); // 파일 전송 성공
        response.end(html);
      });
    } else { // query string이 있는 경우
      fs.readdir('./data', function(error, filelist) {
        console.log(filelist); // 배열의 형태로 나옴
        console.log(path.parse(queryData.id));
        var filteredId = path.parse(queryData.id).base;
        // 입력정보에 대한 보안, 경로에 ..가 들어있으면 다른 파일에 접근할 수 있기 때문에  ..을 제외시켜야 함

        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
          // description은 파일의 내용
          var title = queryData.id; // query string의 id값, query string의 시작은 ?로 시작하는 부분
          // 출력정보에 대한 보안
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description, {
            allowedTags: ['h1'] // 허용되는 태그선택
          }); // 전달받은 내용에 태그가 있으면 저장만 하고 나타내지는 않음(적용x)
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            `<a href="/create">create</a>
            <a href="/update?id=${sanitizedTitle}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>
            `
          );
          response.writeHead(200); // 파일 전송 성공
          response.end(html);
        });
      });
    }
  } else if (pathname === '/create') {
    fs.readdir('./data', function(error, filelist) {
      var title = 'WEB - create';
      var list = template.list(filelist);
      var html = template.HTML(title, list, `<form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `, '');
      response.writeHead(200); // 파일 전송 성공
      response.end(html);
    });
  } else if (pathname === '/create_process') {
    var body = '';
    // post 방식으로 전송되는 data의 양이 많을 경우를 대비해서 서버가 기준량의 데이터를 수신할 때마다 콜백함수(function(data){})를 호출함
    request.on('data', function(data) {
      body = body + data;
    });
    request.on('end', function() {
      var post = qs.parse(body); // post data를 객체화
      console.log(post); // post data 보기
      var title = post.title;
      var description = post.description;
      // data 디렉토리에 description의 내용을 가진 파일 생성함
      fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
        response.writeHead(302, {
          Location: `/?id=${title}` // 페이지를 이 주소로 리다이렉션함
        });
        response.end();
      });
    });
  } else if (pathname === '/update') {
    fs.readdir('./data', function(error, filelist) {
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
        var title = queryData.id;
        var list = template.list(filelist);
        // name ="id"는 기존의 파일 이름
        var html = template.HTML(title, list,
          `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === '/update_process') {
    var body = '';
    request.on('data', function(data) {
      body = body + data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      console.log(post); // post data 보기
      var id = post.id; // 기존의 파일 이름
      var title = post.title; // 새롭게 변경할 파일 이름
      var description = post.description;
      // 파일 이름 변경
      fs.rename(`data/${id}`, `data/${title}`, function(error) {
        // 파일 내용 변경
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {
            Location: `/?id=${title}`
          });
          response.end();
        });
      });
    });
  } else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', function(data) {
      body = body + data;
    });
    request.on('end', function() {
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      // 파일 삭제하기
      fs.unlink(`data/${filteredId}`, function(error) {
        response.writeHead(302, {
          Location: `/` // 홈으로 리다이렉션
        });
        response.end();
      });
    });
  } else {
    response.writeHead(404); // 파일 전송 실패
    response.end('Not found');
  }

});
app.listen(3000);
