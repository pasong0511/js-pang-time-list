//엘리먼트 생성, 클래스 이름 부여
const createEl = (elKind, className = "") => {
  const el = document.createElement(elKind);
  el.className = className;

  return el;
};

const inputBox = document.querySelector(".inputBox");
const createFive = document.querySelector(".createFive");
const createTen = document.querySelector(".createTen");
const createTwenty = document.querySelector(".createTwenty");
const timeListUl = document.querySelector(".timeListUl");
const contentResult = document.querySelector(".contentResult");

const resetBtn = document.querySelector(".resetBtn");
const increaseDouble = document.querySelector(".increaseDouble");
const increaseFive = document.querySelector(".increaseFive");
const allStop = document.querySelector(".allStop");
const allStart = document.querySelector(".allStart");

class Timer {
  constructor() {
    this.time = 0;
    this.running = null;
    this.eventList = [];
  }

  //View에서 받은 시간 등록, 렌더링 하는 callback 함수를 저장시킴
  addEvent(callback) {
    this.eventList.push(callback);
  }

  //실제 시간 this.time 값 변경 반영 함수
  setTime(second) {
    this.time = second;

    //eventList에 이벤트 저장됨
    //callback : 시간 등록, 렌더링 하는 함수 하나씩 꺼내서 실행
    //꺼내면서 새로운 시간 부여
    this.eventList.forEach((callback) => {
      callback(this.time);
    });
  }

  //1초마다 this.time -1 시킨 값을 this.setTime에 전달
  start(second) {
    this.setTime(second);
    this.running = setInterval(() => {
      this.setTime(this.time - 1); //-1초 감소
    }, 1000);
  }

  restart() {
    this.isStop = true;
    this.start(this.time);
  }

  stop() {
    clearTimeout(this.running);
    this.running = null;
  }

  addSecond(second) {
    this.setTime(this.time + second); //기본값 + 압력받아서 넘긴 값
  }

  //두개 시간 빼서 오름차순 정렬
  compare(timer) {
    return this.time - timer.time;
  }
}

class View {
  constructor(ul) {
    this.viewList = []; //뷰 전용 엘리먼트 저장 배열
    this.target = ul; //ul 태그
  }

  //실제 ul에 넣어주는 메소드
  //리스트에 있는 li 목록을 ul에 붙여넣어준다.
  render() {
    this.target.innerText = "";
    const sortViewList = this.viewList.sort((a, b) => a.timer.compare(b.timer));
    const averageTime = Math.floor(
      sortViewList.reduce((acc, { timer }) => acc + timer.time, 0) /
        sortViewList.length
    );

    contentResult.innerText = `총: ${sortViewList.length}건 평균 남은시간: ${
      averageTime ? averageTime : 0
    }초`;

    sortViewList.forEach((item) => {
      this.target.appendChild(item.listItem);
    });
  }

  //li에 들어갈 아이템 생성
  //viewList[] 에 li 엘리먼트와 시간 추가
  addView(timer, inputValue) {
    const listItem = createEl("li", "listItem");
    const inputText = createEl("span", "inputText");
    const remainTime = createEl("span", "remainTime");
    const upTimeBtn = createEl("button", "upTimeBtn");
    const stopBtn = createEl("button", "stopBtn");
    const removeBtn = createEl("button", "removeBtn");

    upTimeBtn.innerText = "+5초";
    stopBtn.innerText = "중지";
    removeBtn.innerText = "삭제";
    remainTime.innerText = `${timer.time}초`;
    inputText.innerText = inputValue;

    listItem.appendChild(inputText);
    listItem.appendChild(remainTime);
    listItem.appendChild(upTimeBtn);
    listItem.appendChild(stopBtn);
    listItem.appendChild(removeBtn);

    //liEl 버튼에 각각 이벤트 등록
    upTimeBtn.addEventListener("click", () => {
      timer.addSecond(5);
    });

    stopBtn.addEventListener("click", () => {
      if (stopBtn.innerText === "중지") {
        stopBtn.innerText = "시작";
        timer.stop();
        return;
      }
      stopBtn.innerText = "중지";
      timer.restart();
    });

    removeBtn.addEventListener("click", (e) => {
      timer.stop();
      this.remove(listItem);
    });

    //view 렌더링 함수를 Timer 클래스에 콜백함수로 넘겨줌
    //time는 Timer 클래스의 setTime()의 this.time
    //타이머 객체에 time를 받아서, -1인 경우에는, 타이머 중단
    timer.addEvent((time) => {
      if (time === 0) {
        timer.stop();
        this.remove(listItem);
        return;
      }

      remainTime.innerText = `${time}초`; //남아있는 시간 넣어주기
      this.render(); //다시 렌더링하기
    });

    this.viewList.push({ listItem, timer }); //li정보랑, timer 배열에 추가
  }

  //5초 층가
  allAddSecond(second) {
    this.viewList.forEach(({ timer }) => timer.addSecond(second));
  }

  //전제 중단
  allStop() {
    this.viewList.forEach((item) => {
      item.listItem.querySelector(".stopBtn").innerText = "시작";
      item.timer.stop();
    });
  }

  //전체 시작
  allStart() {
    this.viewList.forEach((item) => {
      item.listItem.querySelector(".stopBtn").innerText = "중지";
      item.timer.start(item.timer.time);
    });
  }

  //X2배 만들기
  clone() {
    //기존에 배열에 있던 타임 시간 리스트를 기준으로 복사 시작
    [...this.viewList].forEach(({ listItem, timer }) => {
      const prevStop = timer.running === null; //null일때 true
      timer.stop(); //일단 한번 멈춰줌

      const newTimer = new Timer(); //새로운 timer 생성
      newTimer.setTime(timer.time); //시간 상태 변경
      const inputText = listItem.querySelector(".inputText").innerText;
      this.addView(newTimer, inputText); //뷰 변경

      if (!prevStop) {
        timer.restart(); //기존꺼 재실행
        newTimer.restart(); //복사한 시간 재실행
      }
    });

    this.render();
  }

  remove(item) {
    //필터로 제거 버튼 클릭한 엘리먼트 아이템 viewList에서 제거하고 viewList 갱신
    this.viewList = this.viewList.filter(({ listItem }) => listItem !== item);
    this.render();
  }

  reset() {
    this.viewList.forEach(({ timer }) => timer.stop()); //남아있던 시간초 정지
    this.viewList = [];
    this.render();
  }
}

const view = new View(timeListUl);

const createItem = (e, second) => {
  e.preventDefault();

  if (!inputBox.value) {
    //입력값 없으면 실행하지 않음
    return;
  }

  //타이머 객체 생성 -> 타이머 객체에 시간 부여하기
  const timer = new Timer();
  view.addView(timer, inputBox.value); //타이머 객체 전달, 입력 값 넘김
  inputBox.value = "";
  timer.start(second);
};

/*인풋 옆에 있는 버튼 -> 시간 아이템 생성*/
createFive.addEventListener("click", (e) => {
  createItem(e, 5);
});

createTen.addEventListener("click", (e) => {
  createItem(e, 10);
});

createTwenty.addEventListener("click", (e) => {
  createItem(e, 20);
});

/*컨트롤러 이벤트 등록*/
resetBtn.addEventListener("click", () => {
  view.reset();
});

increaseDouble.addEventListener("click", () => {
  view.clone();
});

increaseFive.addEventListener("click", () => {
  view.allAddSecond(5);
});

allStop.addEventListener("click", () => {
  view.allStop();
});

allStart.addEventListener("click", () => {
  view.allStart();
});
