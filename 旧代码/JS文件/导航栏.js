function jr1(li){
    li.style.borderBottomColor = 'rgb(252, 158, 70)';
    li.style.borderBottomWidth = '4px';
    li.style.borderBottomStyle = 'soild'
    
}
function lk1(li){
    
    li.style.borderBottomWidth = '0px';
    
}

var a_img = document.getElementById('hov_a');
a_img.onmouseover = function () {
    this.style.width = '48px'
    this.style.width = '48px'
    this.style.backgroundColor = 'rgb(0,0,0,0.2)'
    this.style.borderRadius = "100%"
    this.style.top = '7px'
    this.style.right = '126px'
}

a_img.onmouseout = function () {
    this.style.width = '41px'
    this.style.width = '41px'
    this.style.backgroundColor = 'rgb(0,0,0,0)'
    this.style.borderRadius = "100%"
    this.style.top = '10px'
    this.style.right = '130px'
}


function dgx(){
    alert('账户功能尚未开放，敬请期待！')
}