// 获取所有要添加动画的元素，使用querySelectorAll获取所有匹配的元素，返回的是NodeList，需要转为数组方便后续操作
const divImg2Elements = Array.from(document.querySelectorAll('.div-img2')); 

divImg2Elements.forEach((divElement) => {
    // 为每个元素单独创建IntersectionObserver实例
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // 当元素进入视口时，给元素添加定义好的动画类
                divElement.classList.add('box-animate'); 
                // 动画触发后取消对该元素的观察
                observer.unobserve(divElement); 
            }
        });
    });
    // 开始观察对应的目标元素
    observer.observe(divElement);
});

// 开始观察目标元素，这里传入的就是之前获取到的要添加动画的元素
observer.observe(div_img2); 