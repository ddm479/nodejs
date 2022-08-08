var q = {
  v1:'v1',
  v2:'v2',
  f1:function (){
    console.log(this.v1);  // this를 사용하면 속해있는 객체의 이름을 신경쓰지 않아도 됨
  },
  f2:function(){
    console.log(this.v2);
  }
}
// 함수가 객체 안에서 사용될 때 그 함수가 속해있는 객체를 참조하는 키워드 : this

q.f1();
q.f2();
