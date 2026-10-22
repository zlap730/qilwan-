function nav_jr(a){
    // 鼠标悬停时改变导航栏样式
    a.style.backgroundColor = "rgba(196, 233, 255, 0.9)";
    a.style.color = "rgb(28, 69, 255)";
    a.style.fontWeight = "900";
    a.style.fontSize = "21px";
}

function nav_lk(a){
    // 鼠标移开时恢复导航栏样式
    a.style.backgroundColor = "rgba(255, 165, 0, 1)";
    a.style.color = "#000";
    a.style.fontWeight = "500";
    a.style.fontSize = "16px";
}

// 加载自行车数据
let bikes = [];
fetch('../json/自行车推荐数据.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        bikes = data.bikes;
        console.log('自行车数据加载成功');
    })
    .catch(error => {
        console.error('加载自行车数据时出错:', error);
        alert('加载数据失败，请刷新页面重试');
    });

var a = document.querySelectorAll("#链接 a");
for (var n = 0; n < a.length; n++) {
    a[n].onmouseover = function () {
        this.style.color
    };
    a[n].onmouseout = function () {
        nav_lk(this);
    };
}

function generateRecommendation() {
    // 获取用户选择
    const terrain = document.querySelector('input[name="terrain"]:checked')?.value;
    const budget = document.querySelector('input[name="budget"]:checked')?.value;
    const needs = document.querySelector('input[name="needs"]:checked')?.value; // 改为获取单个值
    const brand = document.querySelector('input[name="brand"]:checked')?.value;

    // 检查是否所有选项都已选择
    if (!terrain || !budget || !needs || !brand) {
        alert('请完成所有选项的选择');
        return;
    }

    // 过滤逻辑
    let results = bikes.filter(bike => {
        return bike.type.includes(terrain) &&
               checkBudget(bike.price, budget) &&
               bike.needs.includes(needs) &&
               (brand === 'any' || bike.brand === brand);
    });

    // 显示结果
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
            
    if (results.length > 0) {
        let html = '<h3>为您推荐以下车型：</h3>';
        results.forEach(bike => {
            html += `
            <div class="recommendation">
                <h4>${bike.name}（${bike.price}元）</h4>
                <p>适用场景：${getTerrainDesc(bike.type)}</p>
                <p>核心配置：${bike.config}</p>
            </div>
            `;
        });
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = "<p>暂未找到完全匹配的车型，建议放宽筛选条件或自己上网搜搜吧</p>";
    }
}

function checkBudget(price, budget) {
    const ranges = {
        '2000': [0, 2000],
        '5000': [2001, 5000],
        '10000': [5001, 10000],
        'max': [10001, Infinity]
    };
    return price >= ranges[budget][0] && price <= ranges[budget][1];
}

function getTerrainDesc(types) {
    const descMap = {
        'city': '城市道路',
        'mountain': '山地越野',
        'mixed': '混合路面',
        'road': '公路竞速'
    };
    return types.map(t => descMap[t]).join(' / ');
}

function isPersonalRecommendation(bike) {
    // 根据“仅个人推荐”的逻辑，此处示例：仅推荐价格在5000元及以下的车型
    return bike.price <= 5000;
}