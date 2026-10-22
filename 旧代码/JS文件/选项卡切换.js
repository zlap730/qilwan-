// onmouseout="msout()" onmouseover="msover()"

const cards = [
    {
        color: '#FFB74D',
        content: 
            `<a href="./HTML/服装头盔.html" class="card-link personal-gear">
                <h1 class="card-title">人身装备</h1>
                <div class="card-overlay"></div>
            </a>`
    },
    {
        color: '#a8a5a5',
        content: 
        `<a href="./HTML/车架组件.html" class="card-link frame">
           <h1 class="card-title">车架组件</h1>
           <div class="card-overlay"></div>
        </a>`
    },
    {
        color: '#a8a5a5',
        content: 
            `<a href="./HTML/变速器大全.html" class="card-link drivetrain">
                <h1 class="card-title">传动系统</h1>
                <div class="card-overlay"></div>
            </a>`
    },
    {
        color: '#2196F3',
        content: 
            `<a href="./HTML/轮组配件.html" class="card-link wheels">
                <h1 class="card-title">轮组配件</h1>
                <div class="card-overlay"></div>
            </a>`
    },
    {
        color: '#a8a5a5',
        content: 
            `<a href="./HTML/刹车系统.html" class="card-link brakes">
                <h1 class="card-title">刹车系统</h1>
                <div class="card-overlay"></div>
            </a>`
    },    {
        color: '#a8a5a5',
        content: 
            `<a href="./HTML/装配计算器.html" class="card-link diy">
                <h1 class="card-title">自组DIY清单</h1>
                <div class="card-overlay"></div>
            </a>`
    }
];

let currentIndex = 0;
const mainCard = document.getElementById('mainCard');
const leftStack = document.getElementById('leftStack');
const rightStack = document.getElementById('rightStack');

// 初始化
updateStacks();

function navigate(direction) {
    const newIndex = (currentIndex + direction + cards.length) % cards.length;
    const isNext = direction === 1;

    // 设置退出动画
    mainCard.style.animation = isNext ? 
        'slideOutToLeft 0.1s forwards' : 
        'slideOutToRight 0.1s forwards';

    mainCard.addEventListener('animationend', () => {
        // 更新内容
        currentIndex = newIndex;
        mainCard.style.background = cards[currentIndex].color;
        mainCard.querySelector('.card-content').innerHTML = cards[currentIndex].content;

        // 新卡片入场动画
        mainCard.style.animation = isNext ? 
            'slideInFromRight 0.4s forwards' : 
            'slideInFromLeft 0.4s forwards';

        // 更新堆叠
        updateStacks();
    }, { once: true });
    mainCard.querySelector('.card-link').addEventListener('mouseover', msover);
    mainCard.querySelector('.card-link').addEventListener('mouseout', msout);
}

function updateStacks() {
    // 清空堆叠
    leftStack.innerHTML = '';
    rightStack.innerHTML = '';

    // 生成左侧历史堆叠
    for(let i = 1; i <= 3; i++) {
        const index = (currentIndex - i + cards.length) % cards.length;
        if(index === currentIndex) continue;

        const card = createStackCard(index, 'left', i);
        leftStack.appendChild(card);
    }

    // 生成右侧未来堆叠
    for(let i = 1; i <= 3; i++) {
        const index = (currentIndex + i) % cards.length;
        if(index === currentIndex) continue;

        const card = createStackCard(index, 'right', i);
        rightStack.appendChild(card);
    }
}

function createStackCard(index, side, stackIndex) {
    const card = document.createElement('div');
    card.className = 'stack-card';
    card.style.background = cards[index].color;
    card.innerHTML = `
        <div class="card-content">
            ${cards[index].content}
        </div>
    `;

    // 动态样式
    const scale = 1 - stackIndex * 0.1;
    const translateX = stackIndex * 25 * (side === 'left' ? -1 : 1);
    const rotateY = stackIndex * 5 * (side === 'left' ? 1 : -1);

    card.style.transform = `
        translateX(${translateX}px)
        scale(${scale})
        rotateY(${rotateY}deg)
    `;
    card.style.zIndex = 50 - stackIndex;
    card.style.opacity = 1 - stackIndex * 0.2;
    
    card.innerHTML = `
        <div class="card-content">
            ${cards[index].content.replace(/id=/g, "data-dup-id=")} <!-- 防止ID重复 -->
        </div>
    `;
    
    // 禁用堆叠卡片的鼠标事件
    card.style.pointerEvents = 'none';  // 新增：禁用堆叠卡片的交互
    return card;
}

// 响应式适配
window.addEventListener('resize', updateStacks);


