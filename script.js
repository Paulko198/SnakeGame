// 游戏配置
const GAME_CONFIG = {
    CANVAS_SIZE: 400,
    GRID_SIZE: 20,
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 10,
    MIN_SPEED: 80
};

// 游戏状态
let gameState = {
    isRunning: false,
    isPaused: false,
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    speed: GAME_CONFIG.INITIAL_SPEED
};

// 游戏对象
let snake = [{ x: 200, y: 200 }];
let food = {};
let direction = { x: 0, y: 0 };
let gameLoop = null;

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverlay = document.getElementById('gameOverlay');
const gameMessage = document.getElementById('gameMessage');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// 初始化游戏
function initGame() {
    snake = [{ x: 200, y: 200 }];
    direction = { x: 0, y: 0 };
    gameState.score = 0;
    gameState.speed = GAME_CONFIG.INITIAL_SPEED;
    generateFood();
    updateScore();
    updateHighScore();
    drawGame();
}

// 生成食物
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * (GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.GRID_SIZE)) * GAME_CONFIG.GRID_SIZE,
            y: Math.floor(Math.random() * (GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.GRID_SIZE)) * GAME_CONFIG.GRID_SIZE
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_SIZE, GAME_CONFIG.CANVAS_SIZE);

    // 绘制网格
    drawGrid();

    // 绘制蛇
    drawSnake();

    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= GAME_CONFIG.CANVAS_SIZE; i += GAME_CONFIG.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, GAME_CONFIG.CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(GAME_CONFIG.CANVAS_SIZE, i);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(segment.x + 2, segment.y + 2, GAME_CONFIG.GRID_SIZE - 4, GAME_CONFIG.GRID_SIZE - 4);
            
            // 蛇头高光
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(segment.x + 4, segment.y + 4, GAME_CONFIG.GRID_SIZE - 8, GAME_CONFIG.GRID_SIZE - 8);
            
            // 蛇眼
            ctx.fillStyle = '#fff';
            ctx.fillRect(segment.x + 6, segment.y + 6, 3, 3);
            ctx.fillRect(segment.x + 11, segment.y + 6, 3, 3);
            ctx.fillStyle = '#000';
            ctx.fillRect(segment.x + 7, segment.y + 7, 1, 1);
            ctx.fillRect(segment.x + 12, segment.y + 7, 1, 1);
        } else {
            // 蛇身
            const intensity = 1 - (index / snake.length) * 0.3;
            ctx.fillStyle = `rgba(39, 174, 96, ${intensity})`;
            ctx.fillRect(segment.x + 1, segment.y + 1, GAME_CONFIG.GRID_SIZE - 2, GAME_CONFIG.GRID_SIZE - 2);
        }
    });
}

// 绘制食物
function drawFood() {
    // 食物主体
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x + 2, food.y + 2, GAME_CONFIG.GRID_SIZE - 4, GAME_CONFIG.GRID_SIZE - 4);
    
    // 食物高光
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(food.x + 4, food.y + 4, GAME_CONFIG.GRID_SIZE - 8, GAME_CONFIG.GRID_SIZE - 8);
    
    // 食物光泽
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(food.x + 6, food.y + 6, 4, 4);
}

// 移动蛇
function moveSnake() {
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        gameState.score += 10;
        updateScore();
        generateFood();
        
        // 增加游戏速度
        if (gameState.speed > GAME_CONFIG.MIN_SPEED) {
            gameState.speed = Math.max(GAME_CONFIG.MIN_SPEED, gameState.speed - GAME_CONFIG.SPEED_INCREMENT);
        }
        
        // 添加脉冲动画效果
        canvas.classList.add('pulse');
        setTimeout(() => canvas.classList.remove('pulse'), 500);
    } else {
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];

    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= GAME_CONFIG.CANVAS_SIZE || 
        head.y < 0 || head.y >= GAME_CONFIG.CANVAS_SIZE) {
        return true;
    }

    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// 游戏循环
function gameLoopFunction() {
    if (!gameState.isRunning || gameState.isPaused) return;

    moveSnake();

    if (checkCollision()) {
        gameOver();
        return;
    }

    drawGame();
}

// 开始游戏
function startGame() {
    if (gameState.isRunning) return;
    
    gameState.isRunning = true;
    gameState.isPaused = false;
    hideOverlay();
    
    pauseBtn.disabled = false;
    startBtn.textContent = '游戏中...';
    
    gameLoop = setInterval(gameLoopFunction, gameState.speed);
}

// 暂停游戏
function pauseGame() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        clearInterval(gameLoop);
        pauseBtn.textContent = '▶️ 继续';
        showOverlay('⏸️ 游戏暂停', '点击继续按钮恢复游戏', '继续游戏');
    } else {
        gameLoop = setInterval(gameLoopFunction, gameState.speed);
        pauseBtn.textContent = '⏸️ 暂停';
        hideOverlay();
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameLoop);
    gameState.isRunning = false;
    gameState.isPaused = false;
    
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸️ 暂停';
    startBtn.textContent = '开始游戏';
    
    initGame();
    showOverlay('🎮 准备游戏', '使用方向键或WASD控制蛇的移动<br>吃掉红色食物获得分数', '开始游戏');
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameState.isRunning = false;
    gameState.isPaused = false;
    
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸️ 暂停';
    startBtn.textContent = '重新开始';
    
    // 更新最高分
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore);
        updateHighScore();
    }
    
    showOverlay('💀 游戏结束', `本次得分: ${gameState.score}<br>最高分: ${gameState.highScore}`, '重新开始');
}

// 显示覆盖层
function showOverlay(title, message, buttonText) {
    gameMessage.innerHTML = `
        <h2>${title}</h2>
        <p>${message}</p>
        <button id="startBtn" class="game-btn">${buttonText}</button>
    `;
    gameOverlay.classList.remove('hidden');
    
    // 重新绑定开始按钮事件
    document.getElementById('startBtn').addEventListener('click', () => {
        if (gameState.isPaused) {
            pauseGame();
        } else {
            initGame();
            startGame();
        }
    });
}

// 隐藏覆盖层
function hideOverlay() {
    gameOverlay.classList.add('hidden');
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = gameState.score;
}

// 更新最高分显示
function updateHighScore() {
    highScoreElement.textContent = gameState.highScore;
}

// 键盘控制
function handleKeyPress(event) {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    const key = event.key.toLowerCase();
    
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) {
                direction = { x: 0, y: -GAME_CONFIG.GRID_SIZE };
            }
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) {
                direction = { x: 0, y: GAME_CONFIG.GRID_SIZE };
            }
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) {
                direction = { x: -GAME_CONFIG.GRID_SIZE, y: 0 };
            }
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) {
                direction = { x: GAME_CONFIG.GRID_SIZE, y: 0 };
            }
            break;
        case ' ':
        case 'escape':
            event.preventDefault();
            pauseGame();
            break;
    }
}

// 触摸控制（移动端）
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && direction.x === 0) {
                direction = { x: GAME_CONFIG.GRID_SIZE, y: 0 }; // 右
            } else if (deltaX < 0 && direction.x === 0) {
                direction = { x: -GAME_CONFIG.GRID_SIZE, y: 0 }; // 左
            }
        }
    } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && direction.y === 0) {
                direction = { x: 0, y: GAME_CONFIG.GRID_SIZE }; // 下
            } else if (deltaY < 0 && direction.y === 0) {
                direction = { x: 0, y: -GAME_CONFIG.GRID_SIZE }; // 上
            }
        }
    }
}

// 事件监听器
document.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

startBtn.addEventListener('click', () => {
    if (gameState.isPaused) {
        pauseGame();
    } else {
        initGame();
        startGame();
    }
});

pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

// 防止方向键滚动页面
document.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
});

// 初始化游戏
initGame();
