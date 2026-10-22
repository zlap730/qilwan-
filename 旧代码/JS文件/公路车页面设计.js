function showDiv(targetId) {
    // 隐藏所有的div
    document.querySelectorAll('.div-1, .div-2, .div-3').forEach(function(div) {
        div.style.display = 'none';
        div.style.zIndex = '0';
    });

    // 显示点击的div并将其置于顶层
    var targetDiv = document.getElementById(targetId);
    if (targetDiv) {
        targetDiv.style.display = 'block';
        targetDiv.style.zIndex = '10'; // 设置一个高于其他div的zIndex值
    }
}

