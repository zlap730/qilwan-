let lastScrollTop = 0; // 用于记录上一次的滚动位置

window.addEventListener('scroll', function () {
    var sec1 = document.getElementById('sec1');
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 判断当前滚动位置与上一次滚动位置的大小关系，来确定滚动方向
    if (scrollTop < lastScrollTop) {
        // 如果当前滚动位置小于上一次滚动位置，说明用户在向上滑动
        sec1.classList.add('show');
        sec1.classList.remove('hide');
    } else {
        // 如果当前滚动位置大于等于上一次滚动位置，说明用户在向下滑动或者没有滑动变化
        sec1.classList.add('hide');
        sec1.classList.remove('show');
    }

    // 更新上一次的滚动位置，为下一次判断做准备
    lastScrollTop = scrollTop;
});