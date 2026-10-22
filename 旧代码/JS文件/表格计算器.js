// 表格计算逻辑区域
function jsuan(){
    let totalPrice = 0; // 总价格
    let totalQuantity = 0; // 总数量
    const rows = document.querySelectorAll('.item-row');
    
    rows.forEach(row => {
        // 获取每一行的单价、数量和配件的输入框
        let priceInput = row.querySelector('input[name^="单价"]');
        let quantityInput = row.querySelector('input[name^="数量"]');
        
        // 如果单价和数量都存在且为有效值，则进行计算
        if (priceInput && quantityInput) {
            let price = parseFloat(priceInput.value) || 0;  // 获取单价，若无则为0
            let quantity = parseInt(quantityInput.value) || 0;  // 获取数量，若无则为0
            
            totalPrice += price * quantity;  // 累加总价格
            totalQuantity += quantity;  // 累加总数量
        }
    });

    // 在表格底部显示总价和总数量
    alert(`总数量: ${totalQuantity} \n总价格: ¥${totalPrice.toFixed(2)}`);
    const get_but = document.getElementById('jsjs');
    get_but.value = totalPrice+'元￥';
    const get_text = document.getElementById('numnum');
    
}


// 设置计算按钮的鼠标经过出发效果
function chufa(){
    const but = document.getElementById('butbut');
    but.style.color = ' #3399FF';
    but.style.backgroundColor = "rgb(199, 199, 199)";
    but.style.letterSpacing = "5px";
}

//设置鼠标离开时的效果
function likai(){
    const but = document.getElementById('butbut');
    but.style.color = 'black';
    but.style.backgroundColor = "rgb(233, 232, 232)";
    but.style.letterSpacing = "2px";
}




// 设置下载按钮的鼠标经过出发效果
function chufa1(){
    const but = document.getElementById('exportButton');
    but.style.color = '#3399FF';
    but.style.backgroundColor = "rgb(199, 199, 199)";
    but.style.fontSize = '25px';
    but.style.fontWeight = '900';
    but.style.letterSpacing = "4px";
}

//设置下载按钮鼠标离开时的效果
function likai1(){
    const but = document.getElementById('exportButton');
    but.style.color = 'black';
    but.style.backgroundColor = "rgb(233, 232, 232)";
    but.style.fontSize = '20px'
    but.style.fontWeight = '500'
    but.style.letterSpacing = "1px";
}


var trs = document.getElementById('table').querySelectorAll('tr');
for (var i = 0; i < trs.length;i++){
    trs[i].onmouseover = function (){
        this.style.backgroundColor = 'hsla(210, 100%, 56%, 0.25)'
    }
    trs[i].onmouseout = function (){
        this.style.backgroundColor = ''
    }
}
