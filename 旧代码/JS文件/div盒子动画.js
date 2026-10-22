function hov(element) {
    console.log('经过');
    const text = element.querySelector('.strong-p');
    text.classList.add('hov'); // 添加类以放大字体
}

function lika(element) {
    console.log('离开');
    const text = element.querySelector('.strong-p');
    text.classList.remove('hov'); // 移除类以恢复原始大小
}


