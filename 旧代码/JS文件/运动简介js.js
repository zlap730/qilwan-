let currentIndex = 0; // 当前显示的小盒子索引，初始为0

function switchBox(direction) {
    // 获取所有小盒子元素
    let smallBoxes = document.querySelectorAll('.small-box');

    // 根据方向切换索引
    if (direction === 'left') {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = smallBoxes.length - 1;
        }
    } else if (direction === 'right') {
        currentIndex++;
        if (currentIndex >= smallBoxes.length) {
            currentIndex = 0;
        }
    }

    // 先将所有小盒子隐藏
    smallBoxes.forEach(function (box) {
        box.classList.remove('active');
    });

    // 显示当前索引对应的小盒子
    smallBoxes[currentIndex].classList.add('active');
}

// 设置下载按钮的鼠标经过出发效果
function chufa1(){
    const but = document.getElementById('button1');
    but.style.width = '50px'
    but.style.height = '50px'
    but.style.lineHeight = '50px'
    but.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
}

//设置下载按钮鼠标离开时的效果
function likai1(){
    const but = document.getElementById('button1');
    but.style.width = '45px'
    but.style.height = '45px'
    but.style.lineHeight = '43px'
    but.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'
}   

// 设置下载按钮的鼠标经过出发效果
function chufa2(){
    const but = document.getElementById('button2');
    but.style.width = '50px'
    but.style.height = '50px'
    but.style.lineHeight = '50px'
    but.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
}

//设置下载按钮鼠标离开时的效果
function likai2(){
    const but = document.getElementById('button2');
    but.style.width = '45px'
    but.style.height = '45px'
    but.style.lineHeight = '43px'
    but.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'
}

