function login() {
    const identifier = document.getElementById('user').value;
    const pw = document.getElementById('password').value;

    fetch('http://localhost:3000/api/auth/login', { // 修改端口为 3000
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pw })
    })
    .then(response => response.ok ? response.json() : response.json().then(err => { throw err; }))
    .then(data => {
        alert('登录成功！');
        sessionStorage.setItem('token', data.token);
        window.location.href = '../HTML/选择页面.html'; // 登录成功后跳转到个人信息编辑页面
    })
    .catch(() => alert('用户名或密码错误，请重试'));
}

function register() {
    const newUser = document.getElementById('newUser').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    const bio = document.getElementById('bio').value;

    if (newPassword !== confirmPassword) {
        alert('两次输入的密码不一致，请重试');
        return;
    }

    fetch('http://localhost:3000/api/auth/register', { // 修改端口为 3000
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUser, password: newPassword, email, bio })
    })
    .then(response => response.ok ? response.json() : response.json().then(err => { throw err; }))
    .then(() => {
        alert('注册成功！');
        document.getElementById('注册窗口').style.display = 'none';
        document.getElementById('登录窗口').style.display = 'block';
    })
    .catch(() => alert('注册失败，请重试'));
}

document.getElementById('registerLink').addEventListener('click', () => {
    document.getElementById('登录窗口').style.display = 'none';
    document.getElementById('注册窗口').style.display = 'block';
});

document.getElementById('loginLink').addEventListener('click', () => {
    document.getElementById('注册窗口').style.display = 'none';
    document.getElementById('登录窗口').style.display = 'block';
});

