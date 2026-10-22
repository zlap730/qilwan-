document.addEventListener('DOMContentLoaded', () => {
    // 从 Cookie 中获取用户信息
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.split('=')[1])) : null;

    if (!user) {
        alert('请先登录以访问个人信息页面');
        window.location.href = '登陆页面.html'; // 修正路径
        return;
    }

    sessionStorage.setItem('user', JSON.stringify(user)); // 同步到 sessionStorage
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('bio').value = user.bio || '';
    document.getElementById('registrationDate').textContent = `注册时间: ${new Date(user.createdAt).toLocaleDateString()}`;
    if (user && user.avatar) {
        const avatarPreview = document.getElementById('avatarPreview');
                // 修正头像路径为相对路径
                let avatarPath = user.avatar;
                if (avatarPath && avatarPath.includes('localhost:3000/uploads/')) {
                    // 将 http://localhost:3000/uploads/filename 转换为 ../app/uploads/filename
                    const filename = avatarPath.split('/').pop();
                    avatarPath = `../app/uploads/${filename}`;
                }
                avatarPreview.src = avatarPath || '../app/uploads/default_avatar.png';
        avatarPreview.style.display = 'block';
    }
});

function previewAvatar(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const avatarPreview = document.getElementById('avatarPreview');
        avatarPreview.src = reader.result;
        avatarPreview.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}

async function updateProfile() {
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.split('=')[1])) : null;

    if (!user || !user.id) {
        alert('用户信息缺失，请重新登录');
        window.location.href = './登陆页面.html'; // 修正路径
        return;
    }

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const bio = document.getElementById('bio').value;
    const avatarFile = document.getElementById('avatar').files[0];

    if (password !== confirmPassword) {
        alert('两次输入的密码不一致，请重试');
        return;
    }

        const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (password) {
        formData.append('password', password);
    }
    formData.append('bio', bio);
    if (avatarFile) {
        formData.append('avatar', avatarFile);
        // 后端会自动处理旧头像的删除
    }

    try {
        const token = sessionStorage.getItem('token'); // 从 sessionStorage 获取 JWT 令牌
        if (!token) {
            throw new Error('未授权访问，请重新登录');
        }

        const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}` // 确保包含 JWT 令牌
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '更新失败');
        }

        const updatedUser = await response.json();
        alert('信息更新成功');
        document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=3600`;
        sessionStorage.setItem('user', JSON.stringify(updatedUser));

                // 更新头像预览
        const avatarPreview = document.getElementById('avatarPreview');
        let avatarPath = updatedUser.avatar;
        if (avatarPath && avatarPath.includes('localhost:3000/uploads/')) {
            // 将 http://localhost:3000/uploads/filename 转换为 ../app/uploads/filename
            const filename = avatarPath.split('/').pop();
            avatarPath = `../app/uploads/${filename}`;
        }
        avatarPreview.src = avatarPath || '../app/uploads/default_avatar.png';
        avatarPreview.style.display = 'block';

        // 不跳转页面，只刷新当前内容
        // location.reload(); // 如需强制刷新可取消注释
    } catch (error) {
        console.error('Error:', error);
        if (error.message === '未授权访问，请重新登录') {
            window.location.href = './登陆页面.html'; // 修正路径
        } else {
            alert(error.message || '更新失败，请稍后重试');
        }
    }
}

async function deleteAccount() {
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.split('=')[1])) : null;

    if (!user || !user.id) {
        alert('用户信息缺失，请重新登录');
        window.location.href = '登陆页面.html'; // 修正路径
        return;
    }

    if (!confirm('确定要删除账号吗？此操作不可撤销！')) {
        return;
    }

    try {
        const token = sessionStorage.getItem('token'); // 从 sessionStorage 获取 JWT 令牌
        if (!token) {
            throw new Error('未授权访问，请重新登录');
        }

        // 删除用户账号
        const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}` // 确保包含 JWT 令牌
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // 获取错误响应的文本内容
            throw new Error(errorText || '删除账号失败');
        }

                // 后端会在删除用户时自动删除头像文件

        alert('账号已成功注销');
        document.cookie = 'user=; path=/; max-age=0'; // 清除用户 Cookie
        sessionStorage.removeItem('token'); // 清除 JWT 令牌
        window.location.href = './登陆页面.html'; // 跳转到登录页面
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '账号注销失败，请稍后重试');
    }
}

// 绑定事件
function return_home() {
    window.location.href = '../骑乐网.html'; // 修正路径 
}