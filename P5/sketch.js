

let port; //포트를 저장하는 변수
let connectBtn; // 아두이노와 연결을 위한 버튼 변수
let interval_arr = []; // R,Y,G의 주기를 저장하는 변수
let bright_arr = []; // R,Y,G의 밝기를 저장하는 변수
let Button = []; // 상태를 표시하는 버튼 변수
let state; // 상태를 저장하는 변수


function setup() {
  createCanvas(600, 600); // 600,600 사이즈의 캔버스를 생성합니다.
  

  //////신호등의 상태를 나타내고 변경할 수 있는 버튼
  Button[0] = createButton("Emergency"); // emergency버튼생성
  Button[1] = createButton("Bilnk"); // blink버튼 생성
  Button[2] = createButton("Off");  // off 버튼 생성
  Button[3] = createButton("Normal"); // normal버튼 생성
  
  Button[0].position(260,400); //버튼들의 위치 설정합니다.
  Button[1].position(260,440);
  Button[2].position(260,480);
  Button[3].position(260,520);
 
  Button[0].size(80, 30); //버튼들의 크기를 설정합니다.
  Button[1].size(80, 30);
  Button[2].size(80, 30);
  Button[3].size(80, 30);
  
  Button[0].mousePressed(Emergency_button);//버튼이 눌렸을 때 실행할 함수를 설정합니다
  Button[1].mousePressed(Bilnk_button);
  Button[2].mousePressed(Off_button);
  Button[3].mousePressed(Normal_button);
  
  
  
  
  /////시리얼 통신
  port = createSerial(); //시리얼 통신을 위한 객체를 생성합니다.
  let usedPorts = usedSerialPorts(); //사용 가능한 포트를 저장합니다.
  if (usedPorts.length > 0) { 
    port.open(usedPorts[0], 9600); // 사용가능한 포트가 있다면 첫번째 포트를 9600 rate로 
  }
  connectBtn = createButton("Connect to Arduino"); // 통신 설정을 위한 버튼 객체를 생성합니다.
  connectBtn.position(230, 260);//버튼의 위치를 설정합니다.
  connectBtn.mousePressed(connectBtnClick);//버튼이 눌렸을 때 실행할 함수를 설정합니다

  
  
   ////// 주기설정을 위한 슬라이더
  for(let i = 0; i<3; i++){
    if(i == 1){
    interval_arr[i] = createSlider(100,5000,500); //노란색은 초기값 500ms로 슬라이더 객체생성
    }
    else{
    interval_arr[i] = createSlider(100,5000,2000); //빨간색,녹색은 초기값 2000ms로 슬라이더 생성 
    }
    
    interval_arr[i].position( 50 ,400+ 65*i ); //65간격으로 슬라이더 위치 설정
    interval_arr[i].size(150); // 사이즈 설정
    interval_arr[i].mouseReleased(Slider); // 슬라이더 값 변경시 호출할 함수 설정
  }

  
  
  //////밝기 초기값은 0으로 설정
  bright_arr[0] = 0; 
  bright_arr[1] = 0;
  bright_arr[2] = 0;
  
  //초기 상태 설정
  state = 3; // 3은 normal state
  
  
}

function draw() {
   background(240) // 배경색 설정
 
  
  /////시리얼통신을 통해 값을 전달 받은 경우
  if(port.available()) { // 버퍼에 읽을 수 있는 값이 있다면

    let str = port.readUntil("\n"); // 개행문자까지 읽습니다.
    
    if(str == "B\n"){ // 읽은 문자가 밝기를 나타내는 B라면 밝기를 처리하는 함수를 호출
       read_bright();  
     }
    else if( str == "S\n"){ //읽은 문자가 상태를 나타내는 S라면 상태를 처리하는 함수를 호출
       read_state();
    }
  } 
  
  
  
  
  ////// 신호등 테두리 검은색
  fill(40) 
  noStroke()
  rect(150,90, 300,120,40)
  
  
  
  //////ui배경, 신호등 불빛 바탕색 힌바탕
  fill(255)
  rect(10,300,580,500,25) 
  circle(205,150,80 ); 
  circle(300,150,80 ); 
  circle(395,150,80 ); 
  
  
  
  
  
  ///// 함수 read_bright에서 갱신된 bright_arr값으로 채도,투명도를 조절해 신호등 표현 
  fill(bright_arr[0]+100 ,0,0,bright_arr[0]+70); //빨간불 색 설정
  circle(205,150,80);
  
  fill(bright_arr[1]+100,bright_arr[1]+100,0 ,bright_arr[1]+70);// 노란불 색 설정
  circle(300,150,80 );
  
  fill(0,bright_arr[2]+100,0 ,bright_arr[2]+100);//녹색불 색 설정
  circle(395,150,80 );

  
  
  
  
  
  //////주기,상태,밝기 정보를 쉽게 파악하도록 텍스트로 표시했습니다.
  fill(0);
  textSize(24)
  
  text("Interval",95,350)
  text("State",275,350)
  text("Brightness",420,350)
  
  
  
  
  
  //////슬라이더의 값을 읽어 표시합니다.
  fill(70);
  textSize(16)
  
  text("Red interval",50,440);
  text(interval_arr[0].value(),160,440) // 빨간불의 주기 
  
  text("Yellow interval",50,505);
  text(interval_arr[1].value(),160,505) //노란불 주기
  
  text("Green interval",50,570);
  text(interval_arr[2].value(),160,570) // 녹색불 주기

  

  
  ///// 함수 read_state에서 state값이 갱신되면 y좌표값도 갱신되도록하는 사각형을
  ///// 현재 신호등상태에 해당하는 버튼위치에 그려지도록해서 상태를 나타냅니다.
  noFill();
  stroke(0,0,255);
  strokeWeight(5);
  rect(260,400+state*40,80,30,2); 
  
  fill(70)
  noStroke()  
  
   //// 함수 read_bright에서 갱신된 bright_arr 값으로 R,Y,G값 텍스트로 표시
  text("Red brightness",400, 425)
  text( bright_arr[0],540, 425) // 빨간불의 밝기
  
  text("Yellow brightness",400, 475)
  text( bright_arr[1],540, 475) // 노란불의 밝기
  
  text("Green brightness",400, 525)
  text( bright_arr[2],540, 525) // 녹색불의 밝기
  
}



/////시리얼 통신을 위한 버튼이 클릭된 경우 호출되는 함수입니다.
function connectBtnClick() {
  if (!port.opened()) { // 통신중이 아닌 경우 
    port.open(9600); // 9600 budrate로 통신을 시작합니다.
  } else {
    port.close(); //통신중인 경우 눌린다면 통신을 끝냅니다.
  }
}



//// 시리얼 통신으로 받은값이 B일 경우 호출되는 함수입니다. 
function read_bright(){
  
  for(let i = 0; i<3; i++){ // R -> Y -> G 순으로 반복합니다.  
    let str = port.readUntil("\n");  //개행문자까지 읽어서 밝기 정보를 저장합니다.
    bright_arr[i] = parseInt(str); // 저장된 정보를 정수로 바꾸어 밝기를 갱신합니다.
    
  }
}


///// 시리얼 통신으로 받은값이 S일 경우 호출되는 함수입니다.
function read_state(){
  
    
    let str = port.readUntil("\n"); // 개행문자까지 읽어서 상태정보를 저장합니다.
    state = parseInt(str); // 저장된 정보를 정수로 바꾸어 상태를 갱신합니다.
    
}



/////슬라이더가 조정된 경우 호출되는 함수입니다.
function Slider() {
  
  let data = [];
  
  for(let i = 0; i<3; i++){ // r->y->g 순서로 반복합니다.
    data[i] = String(interval_arr[i].value()); // 각 슬라이더의 값을 받아서 저장합니다. 
  }
  
  for(let i = 0; i<3; i++){// r->y->g 순서로 반복합니다.
    port.write(data[i] +""+ i+"\n"); //슬라이더값과 불빛색을 나타내는 0(r),1(y),2(g)를 포함해서 값을 보냅니다. 
 
  }
}


////// emergency 버튼이 눌린경우 호출되는 함수입니다.
function Emergency_button(){
  
   port.write(0 + ""+ "S"+"\n"); //emergency를 나타내는 0과 상태정보임을 나타내는S를 보냅니다.
  
}



////// blink 버튼이 눌린경우 호출되는 함수입니다.
function Bilnk_button(){
  port.write(1 + ""+ "S"+"\n"); //blink를 나타내는 1과 상태정보임을 나타내는 S를 보냅니다.
}


//////off버튼이 눌린경우 호출되는 함수입니다.
function Off_button(){
  
  port.write(2 + ""+ "S"+"\n"); //off를 나타내는 2와 상태정보임을 나타내는 S를 보냅니다.
}


//// normal 버튼이 눌린경우 호출되는 함수입니다.
function Normal_button(){
  
  port.write(3 + ""+ "S"+"\n"); //normal을 나타내는 3과 상태저보임을 나타내는 S를 보냅니다.
}

