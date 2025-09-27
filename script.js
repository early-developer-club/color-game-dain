class ColorGame {
    constructor() {
        this.currentLevel = 1;
        this.timeLeft = 60;
        this.gameTimer = null;
        this.correctAnswer = null;
        this.isGameActive = false;
        this.highScore = localStorage.getItem('colorGameHighScore') || 0;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameBoard = document.getElementById('game-board');
        this.currentLevelDisplay = document.querySelectorAll('#current-level');
        this.timerDisplay = document.getElementById('timer');
        this.finalLevelDisplay = document.getElementById('final-level');
        this.highScoreDisplay = document.getElementById('high-score');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
    }

    startGame() {
        this.currentLevel = 1;
        this.timeLeft = 60;
        this.isGameActive = true;
        
        this.showScreen('game');
        this.startTimer();
        this.generateLevel();
    }

    restartGame() {
        this.isGameActive = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        this.showScreen('start');
    }

    showScreen(screenName) {
        // 모든 화면 숨기기
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // 선택된 화면 보이기
        switch(screenName) {
            case 'start':
                this.startScreen.classList.remove('hidden');
                break;
            case 'game':
                this.gameScreen.classList.remove('hidden');
                break;
            case 'result':
                this.resultScreen.classList.remove('hidden');
                break;
        }
    }

    startTimer() {
        this.updateTimerDisplay();
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.timeLeft;
    }

    generateLevel() {
        this.currentLevelDisplay.forEach(display => {
            display.textContent = this.currentLevel;
        });
        
        // 단계에 따른 네모 개수 계산 (제곱수로 설정: 4, 9, 16, 25, 36, 49, 64...)
        const squareCount = Math.pow(Math.ceil(Math.sqrt(3 + (this.currentLevel - 1))), 2);
        
        // 단계에 따른 RGB 차이 조절 (1~30단계, 더 쉬운 난이도)
        // 초반 가파르게 감소, 후반 서서히 감소하는 지수 함수 사용
        // 1단계: 100, 30단계: 5 (더 쉬운 곡선형 차이)
        const fixedRGBDifference = Math.max(5, 100 * Math.pow(0.85, this.currentLevel - 1));
        
        this.generateSquares(squareCount, fixedRGBDifference);
    }

    generateSquares(count, fixedRGBDifference) {
        this.gameBoard.innerHTML = '';
        
        // 그리드 레이아웃 설정
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        this.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // 기본 RGB 색상 생성 (랜덤한 RGB 값)
        const baseR = Math.floor(Math.random() * 256);
        const baseG = Math.floor(Math.random() * 256);
        const baseB = Math.floor(Math.random() * 256);
        
        // 정답 인덱스 선택
        this.correctAnswer = Math.floor(Math.random() * count);
        
        // 네모들 생성
        for (let i = 0; i < count; i++) {
            const square = document.createElement('div');
            square.className = 'color-square';
            
            let color;
            if (i === this.correctAnswer) {
                // 정답 색상 (고정된 RGB 차이 - 모든 채널이 같은 방향)
                const direction = Math.random() < 0.5 ? 1 : -1;
                const rDiff = direction * fixedRGBDifference;
                const gDiff = direction * fixedRGBDifference;
                const bDiff = direction * fixedRGBDifference;
                
                // RGB 편차를 더 고르게 하기 위해 각각에 약간의 랜덤 요소 추가 (최대 ±20%)
                const rVariation = rDiff * (0.8 + Math.random() * 0.4); // 80%~120% 범위
                const gVariation = gDiff * (0.8 + Math.random() * 0.4);
                const bVariation = bDiff * (0.8 + Math.random() * 0.4);
                
                const newR = Math.max(0, Math.min(255, baseR + rVariation));
                const newG = Math.max(0, Math.min(255, baseG + gVariation));
                const newB = Math.max(0, Math.min(255, baseB + bVariation));
                
                color = `rgb(${Math.floor(newR)}, ${Math.floor(newG)}, ${Math.floor(newB)})`;
            } else {
                // 일반 색상
                color = `rgb(${baseR}, ${baseG}, ${baseB})`;
            }
            
            square.style.backgroundColor = color;
            square.addEventListener('click', () => this.handleSquareClick(i));
            
            this.gameBoard.appendChild(square);
        }
    }

    handleSquareClick(clickedIndex) {
        if (!this.isGameActive) return;
        
        const squares = this.gameBoard.querySelectorAll('.color-square');
        const clickedSquare = squares[clickedIndex];
        
        // 모든 네모의 선택 상태 초기화
        squares.forEach(square => {
            square.classList.remove('selected', 'correct', 'wrong');
        });
        
        // 클릭한 네모 선택 표시
        clickedSquare.classList.add('selected');
        
        if (clickedIndex === this.correctAnswer) {
            // 정답
            clickedSquare.classList.add('correct');
            this.isGameActive = false;
            
            // 모든 네모 클릭 비활성화
            squares.forEach(square => {
                square.style.pointerEvents = 'none';
            });
            
            setTimeout(() => {
                this.nextLevel();
            }, 500);
        } else {
            // 오답 - 게임은 계속 진행
            clickedSquare.classList.add('wrong');
            
            // 시간 감소 (3초)
            this.timeLeft = Math.max(0, this.timeLeft - 3);
            this.updateTimerDisplay();
            
            // 화면 흔들림 효과
            this.shakeScreen();
            
            // 0.5초 후 오답 표시 제거하고 게임 계속
            setTimeout(() => {
                clickedSquare.classList.remove('wrong');
                this.isGameActive = true;
            }, 500);
        }
    }

    shakeScreen() {
        const gameBoard = this.gameBoard;
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            if (shakeCount < 6) {
                gameBoard.style.transform = `translateX(${shakeCount % 2 === 0 ? -2 : 2}px)`;
                shakeCount++;
            } else {
                gameBoard.style.transform = 'translateX(0)';
                clearInterval(shakeInterval);
            }
        }, 50);
    }

    nextLevel() {
        this.currentLevel++;
        this.isGameActive = true;
        this.generateLevel();
    }

    endGame() {
        this.isGameActive = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        // 최고 점수 업데이트
        const finalLevel = this.currentLevel - 1;
        if (finalLevel > this.highScore) {
            this.highScore = finalLevel;
            localStorage.setItem('colorGameHighScore', this.highScore);
        }
        
        // 결과 화면에 정보 표시
        this.finalLevelDisplay.textContent = finalLevel;
        this.highScoreDisplay.textContent = this.highScore;
        
        this.showScreen('result');
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new ColorGame();
});
