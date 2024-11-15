// grid-container에 접근
const gridContainer = document.getElementById('grid-container');

// 9x9 정사각형을 생성하여 grid-container에 추가
for (let i = 0; i < 81; i++) {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridContainer.appendChild(gridItem);
}

// 셔플 함수
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 보드 초기화 및 랜덤 위치에 숫자 표시
function display_board() {
    const gridItems = document.querySelectorAll('.grid-item');
    
    // 먼저 그리드의 모든 셀을 초기화
    gridItems.forEach((item) => {
        item.innerText = ''; // 셀을 초기화
        item.style.backgroundColor = ''; // 배경 색도 초기화
    });

    let positions = [];
    while (positions.length < 36) {
        let randomIndex = Math.floor(Math.random() * 81);
        if (!positions.includes(randomIndex)) {
            positions.push(randomIndex);
        }
    }

    // 보드의 값을 그리드에 맞게 업데이트
    positions.forEach((index) => {
        const i = Math.floor(index / 9);
        const j = index % 9;
        const gridItem = gridItems[index];

        // 숫자가 있을 때만 표시
        if (board[i][j] !== 0) {
            gridItem.innerText = board[i][j];
        }
    });
}

// Sudoku 보드 관련 데이터 초기화
let board = Array.from({ length: 9 }, () => Array(9).fill(0));
let row = Array.from({ length: 9 }, () => Array(10).fill(0));
let col = Array.from({ length: 9 }, () => Array(10).fill(0));
let diag = Array.from({ length: 9 }, () => Array(10).fill(0));
let end = false;
let gameStarted = false;
let selectedCell = null; // 마지막으로 선택한 칸을 추적

// 보드 생성
function board_init() {
    let num_list = Array.from({ length: 9 }, (_, i) => (i + 1));
    let nums = shuffle(num_list);
    let idx = 0;
    for (let i = 0; i < 9; i += 3) {
        for (let j = 0; j < 9; j += 3) {
            board[i][j] = nums[idx];
            row[i][nums[idx]] = 1;
            col[j][nums[idx]] = 1;
            diag[Math.floor(i / 3) * 3 + Math.floor(j / 3)][nums[idx]] = 1;
            idx += 1;
        }
    }
}

// 재귀적으로 보드를 채움
function fill_board(k) {
    if (k >= 81) {
        end = true;
        display_board();
        return;
    }

    let i = Math.floor(k / 9);
    let j = k % 9;
    if (board[i][j] !== 0) {
        fill_board(k + 1);
        return;
    }

    for (let n = 1; n <= 9; n++) {
        if (row[i][n] === 0 && col[j][n] === 0 && diag[Math.floor(i / 3) * 3 + Math.floor(j / 3)][n] === 0) {
            board[i][j] = n;
            row[i][n] = col[j][n] = diag[Math.floor(i / 3) * 3 + Math.floor(j / 3)][n] = 1;
            fill_board(k + 1);
            if (end) return;
            board[i][j] = 0;
            row[i][n] = col[j][n] = diag[Math.floor(i / 3) * 3 + Math.floor(j / 3)][n] = 0;
        }
    }
}

let clicked = false; // 이미 숫자가 채워진 곳을 클릭했을 때만 false;

// Start 버튼 클릭 시 보드 초기화 및 숫자 표시
document.getElementById('StartButton').addEventListener('click', function () {
    gameStarted = true;

    board = Array.from({ length: 9 }, () => Array(9).fill(0));
    row = Array.from({ length: 9 }, () => Array(10).fill(0));
    col = Array.from({ length: 9 }, () => Array(10).fill(0));
    diag = Array.from({ length: 9 }, () => Array(10).fill(0));
    end = false;

    board_init();
    fill_board(0);

    document.getElementById('StartButton').style.display = 'none';
    document.getElementById('RestartButton').style.display = 'inline-block';
    document.getElementById('heart1').style.display = 'inline-block';
    document.getElementById('heart2').style.display = 'inline-block';
    document.getElementById('heart3').style.display = 'inline-block';

    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach((item) => {
        item.addEventListener('click', function () {
            if (gameStarted && item.innerText === '') {
                // 이전에 선택한 칸의 색을 원래대로 복원
                if (selectedCell) {
                    selectedCell.style.backgroundColor = '';
                }

                // 현재 클릭한 칸을 녹색으로 설정하고 selectedCell에 저장
                item.style.backgroundColor = 'green';
                selectedCell = item;
                clicked = true;
            }
        });
    });
});

// number-container 안의 각 number-item에 클릭 이벤트 리스너 추가
document.querySelectorAll('.number-item').forEach((numberItem) => {
    numberItem.addEventListener('click', function () {
        if(selectedCell && clicked){
            const gridItems = document.querySelectorAll('.grid-item');
            const index = Array.from(gridItems).indexOf(selectedCell);

            // index를 이용해 row, col 계산
            const rowIndex = Math.floor(index / 9);
            const colIndex = index % 9;

            // 'board' 배열에서 해당 셀의 값을 가져옴
            const boardValue = board[rowIndex][colIndex];

            // 'numberItem'의 innerText와 'board' 배열의 값이 같을 때만 실행
            if (numberItem.innerText == boardValue) {
                selectedCell.innerText = numberItem.innerText;
                selectedCell.style.backgroundColor = ''; 
                checkIfBoardFilled(); 
            } else{
                numberItem.style.backgroundColor = 'red';

                // 1초 후 배경색을 원래대로 되돌림
                setTimeout(() => {
                    numberItem.style.backgroundColor = ''; // 원래 배경색으로 복구
                }, 1000);

                let hearts = [document.getElementById('heart3'), document.getElementById('heart2'), document.getElementById('heart1')];
                if (hearts[1].style.display == 'none'){
                        displayGameOverMessage();
                    }
                for (let i = 0; i < hearts.length; i++) {
                    if (hearts[i].style.display !== 'none') {
                        hearts[i].style.display = 'none'; // 첫 번째로 보이는 하트를 숨김
                        break; // 하나만 숨기고 멈춤
                    }
                }
            }
        }
    })
});


// Restart 버튼 클릭 시 보드 초기화
document.getElementById('RestartButton').addEventListener('click', function () {
    gameStarted = false;

    board = Array.from({ length: 9 }, () => Array(9).fill(0));
    row = Array.from({ length: 9 }, () => Array(10).fill(0));
    col = Array.from({ length: 9 }, () => Array(10).fill(0));
    diag = Array.from({ length: 9 }, () => Array(10).fill(0));
    end = false;

    display_board();
    selectedCell = null; // 리셋할 때 선택된 칸도 초기화

    document.getElementById('StartButton').style.display = 'inline-block';
    document.getElementById('RestartButton').style.display = 'none';
    document.getElementById('heart1').style.display = 'none';
    document.getElementById('heart2').style.display = 'none';
    document.getElementById('heart3').style.display = 'none';

    const gameOverMessage = document.querySelector('.game-over-message');
    if (gameOverMessage) {
        gameOverMessage.remove(); // 게임 오버 메시지 삭제
    }
});

function displayGameOverMessage() {
    const gameOverMessage = document.createElement('div');
    gameOverMessage.classList.add('game-over-message');
    gameOverMessage.innerText = 'Game Over!';

    // 게임 오버 창을 body에 추가
    document.body.appendChild(gameOverMessage);

    // 메시지가 화면에 표시되면, 3초 후 자동으로 사라지게 설정
    setTimeout(() => {
        gameOverMessage.remove();
    }, 3000);
}

function checkIfBoardFilled() {
    let isFilled = true;
    const gridItems = document.querySelectorAll('.grid-item');
    
    gridItems.forEach((item) => {
        if (item.innerText === '') { // 빈 칸이 있으면 false로 설정
            isFilled = false;
        }
    });

    // 보드가 다 채워지면 성공 메시지 표시
    if (isFilled) {
        displaySuccessMessage();
    }
}

function displaySuccessMessage() {
    const existingMessage = document.querySelector('.game-success-message');
    if (!existingMessage) {
        const successMessage = document.createElement('div');
        successMessage.classList.add('game-success-message');
        successMessage.innerText = 'Success!';

        // 성공 메시지를 body에 추가
        document.body.appendChild(successMessage);

        // 메시지가 화면에 표시되면, 3초 후 자동으로 사라지게 설정
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }
}