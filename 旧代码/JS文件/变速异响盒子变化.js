

var yx_li = document.getElementsByClassName('cf');
var xs_div = document.getElementsByClassName('xs');

// 定义选项卡和内容区域的默认z-index值，方便后续调整和维护
const DEFAULT_TAB_Z_INDEX = 1;
const DEFAULT_CONTENT_Z_INDEX = 0;
const ACTIVE_CONTENT_Z_INDEX = 10;

for (var i = 0; i < yx_li.length; i++) {
    // 鼠标移入事件
    yx_li[i].onmouseover = function () {
        for (var j = 0; j < yx_li.length; j++) {
            // 移除所有选项卡的active类，恢复默认颜色
            yx_li[j].classList.remove('active');
            yx_li[j].classList.add('default');
        }
        // 给当前鼠标移入的选项卡添加active类，实现变色效果
        this.classList.remove('default');
        this.classList.add('active');

        for (var j = 0; j < xs_div.length; j++) {
            // 隐藏所有内容区域
            xs_div[j].style.opacity = 0;
            // 恢复所有内容区域的默认z-index值
            xs_div[j].style.zIndex = DEFAULT_CONTENT_Z_INDEX;
        }
        // 根据索引显示对应的内容区域
        var index = Array.from(yx_li).indexOf(this);
        if (index > -1) {
            xs_div[index].style.opacity = 1;
            // 当鼠标移入时，将对应内容区域的z-index值提高，使其显示在较上层
            xs_div[index].style.zIndex = ACTIVE_CONTENT_Z_INDEX;
        }
    };
    // 点击事件
    yx_li[i].onclick = function () {
        for (var j = 0; j < yx_li.length; j++) {
            // 移除所有选项卡的active类，恢复默认颜色
            yx_li[j].classList.remove('active');
            yx_li[j].classList.add('default');
        }
        // 给当前点击的选项卡添加active类，保持变色效果
        this.classList.remove('default');
        this.classList.add('active');

        for (var k = 0; k < xs_div.length; k++) {
            // 隐藏所有内容区域
            xs_div[k].style.opacity = 0;
            // 恢复所有内容区域的默认z-index值
            xs_div[k].style.zIndex = DEFAULT_CONTENT_Z_INDEX;
        }
        // 根据索引显示对应的内容区域并保持显示
        var index = Array.from(yx_li).indexOf(this);
        if (index > -1) {
            xs_div[index].style.opacity = 1;
            // 点击后，将对应内容区域的z-index值提高，使其显示在较上层并保持
            xs_div[index].style.zIndex = ACTIVE_CONTENT_Z_INDEX;
        }
    };
}

// 页面加载时，给第一个选项卡添加默认样式类，并设置初始的图层顺序
window.onload = function () {
    yx_li[0].classList.add('default');
    for (var i = 0; i < xs_div.length; i++) {
        xs_div[i].style.zIndex = DEFAULT_CONTENT_Z_INDEX;
    }
    xs_div[0].style.zIndex = ACTIVE_CONTENT_Z_INDEX;
};