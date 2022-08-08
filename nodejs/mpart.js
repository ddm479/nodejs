var M = {
  v:'v',
  f:function(){
    console.log(this.v);
  }
}

module.exports = M; // M이 가리키는 객체를 이 모듈 바깥에서 사용가능하게 한다.
