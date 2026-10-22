document.addEventListener('DOMContentLoaded', function() {
    const toggleCommentButton = document.querySelector('.toggleCommentButton');
    const commentForm = document.querySelector('.commentForm');
    const submitButton = document.querySelector('.submitButton');
    const commentInput = document.querySelector('.commentInput');
    const commentImageInput = document.querySelector('.commentImageInput');
    const commentsContainer = document.querySelector('.commentsContainer');
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');
    const closeModal = document.querySelector('.close');

        // 获取用户token
    const token = sessionStorage.getItem('token');
    
    // API基础URL
    const API_BASE_URL = 'http://localhost:3000/api/comments';
    
        // 添加评论样式
    const style = document.createElement('style');
    style.textContent = `
        .comment {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            background-color: #fff;
        }
        .comment-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }
        .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            object-fit: cover;
        }
        .comment-avatar-default {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            background-color: #007bff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        .comment-user-info {
            display: flex;
            flex-direction: column;
        }
        .comment-username {
            font-weight: bold;
            color: #333;
        }
        .comment-time {
            font-size: 12px;
            color: #999;
        }
        .comment-content {
            margin-bottom: 12px;
        }
        .comment-content p {
            margin: 0 0 8px 0;
            line-height: 1.5;
        }
        .comment-image {
            max-width: 100%;
            max-height: 300px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 8px;
        }
        .comment-actions {
            display: flex;
            justify-content: flex-end;
        }
        .deleteButton {
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .deleteButton:hover {
            background-color: #c82333;
        }
    `;
    document.head.appendChild(style);
    
        // 刷新评论列表函数
    function refreshComments() {
        console.log('开始刷新评论列表...');
        fetch(API_BASE_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(comments => {
                console.log('获取到评论:', comments.length, '条');
                // 清空现有评论
                commentsContainer.innerHTML = '';
                // 只添加状态为active的评论
                const activeComments = comments.filter(comment => {
                    // 检查评论是否有status字段，如果没有默认为active
                    return comment.status === undefined || comment.status === 'active';
                });
                console.log('活跃评论:', activeComments.length, '条');
                // 重新添加所有活跃评论
                activeComments.forEach(comment => {
                    addCommentToDOM(comment);
                });
            })
            .catch(error => {
                console.error('刷新评论失败:', error);
                alert('刷新评论失败: ' + error.message);
            });
    }
    
        // 添加评论到DOM的函数
    function addCommentToDOM(comment) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.dataset.id = comment.id;
        
                // 构建用户名和头像
                const username = comment.User ? comment.User.username : '匿名用户';
                let avatarUrl = comment.User && comment.User.avatar ? comment.User.avatar : '';
        
                // 处理头像路径：将 /uploads/ 转换为 ../app/uploads/
                if (avatarUrl) {
                    // 移除可能的 http://localhost:3000 前缀
                    avatarUrl = avatarUrl.replace('http://localhost:3000', '');
                    // 将 /uploads/ 转换为 ../app/uploads/
                    if (avatarUrl.startsWith('/uploads/')) {
                        avatarUrl = avatarUrl.replace('/uploads/', '../app/uploads/');
                    }
                }
        
                const avatar = avatarUrl ? 
                    `<img src="${avatarUrl}" class="comment-avatar" alt="${username}">` : 
                    '<div class="comment-avatar-default"></div>';
        
                // 构建图片HTML
                let imageHtml = '';
                if (comment.image) {
                    // 处理评论图片路径：将 /uploads/ 转换为 ../app/uploads/
                    let imageUrl = comment.image;
                    if (imageUrl) {
                        // 移除可能的 http://localhost:3000 前缀
                        imageUrl = imageUrl.replace('http://localhost:3000', '');
                        // 将 /uploads/ 转换为 ../app/uploads/
                        if (imageUrl.startsWith('/uploads/')) {
                            imageUrl = imageUrl.replace('/uploads/', '../app/uploads/');
                        }
                    }
                    imageHtml = `<img src="${imageUrl}" class="comment-image" alt="评论图片">`;
                } else if (comment.CommentImages && comment.CommentImages.length > 0) {
                    imageHtml = comment.CommentImages.map(img => {
                        let imgUrl = img.imageUrl;
                        if (imgUrl) {
                            // 移除可能的 http://localhost:3000 前缀
                            imgUrl = imgUrl.replace('http://localhost:3000', '');
                            // 将 /uploads/ 转换为 ../app/uploads/
                            if (imgUrl.startsWith('/uploads/')) {
                                imgUrl = imgUrl.replace('/uploads/', '../app/uploads/');
                            }
                        }
                        return `<img src="${imgUrl}" class="comment-image" alt="评论图片">`;
                    }).join('');
                }
        
        // 格式化时间
        const time = comment.created_at ? 
            new Date(comment.created_at).toLocaleString('zh-CN') : 
            '刚刚';
        
        commentElement.innerHTML = `
            <div class="comment-header">
                ${avatar}
                <div class="comment-user-info">
                    <span class="comment-username">${username}</span>
                    <span class="comment-time">${time}</span>
                </div>
            </div>
            <div class="comment-content">
                <p>${comment.content || ''}</p>
                ${imageHtml}
            </div>
            <div class="comment-actions">
                <button class="deleteButton" data-id="${comment.id}">删除</button>
            </div>
        `;
        commentsContainer.appendChild(commentElement);

                // 添加删除按钮的事件监听器
        const deleteButton = commentElement.querySelector('.deleteButton');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const commentId = this.getAttribute('data-id');
                
                // 检查token是否存在
                const currentToken = sessionStorage.getItem('token');
                if (!currentToken) {
                    alert('请先登录后再操作');
                    return;
                }
                
                // 添加确认对话框
                if (!confirm('确定要删除这条评论吗？')) {
                    return;
                }
                
                // 显示加载状态
                this.disabled = true;
                this.textContent = '删除中...';
                
                fetch(`${API_BASE_URL}/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                })
                .then(response => {
                    // 即使返回错误也尝试解析响应
                    return response.json().then(data => {
                        return {
                            ok: response.ok,
                            status: response.status,
                            data: data
                        };
                    });
                })
                .then(result => {
                    if (result.ok && result.data.message === 'Comment deleted') {
                        // 从DOM中移除
                        commentElement.remove();
                        alert('删除成功！');
                        // 同时重新获取评论列表以确保同步
                        refreshComments();
                    } else {
                        console.error('删除评论失败:', result.data);
                        if (result.status === 403) {
                            alert('无权删除此评论：只有评论作者可以删除自己的评论');
                        } else if (result.status === 404) {
                            alert('评论不存在或已被删除');
                        } else {
                            alert('删除失败: ' + (result.data.error || result.data.message || '未知错误'));
                        }
                    }
                })
                .catch(error => {
                    console.error('网络错误:', error);
                    alert('网络错误，请检查连接');
                })
                .finally(() => {
                    // 恢复按钮状态
                    this.disabled = false;
                    this.textContent = '删除';
                });
            });
        }

        // 添加图片点击事件监听器
        const commentImages = commentElement.querySelectorAll('.comment-image');
        commentImages.forEach(img => {
            img.addEventListener('click', function() {
                modal.style.display = 'block';
                modalImg.src = this.src;
                modalImg.alt = this.alt;
            });
        });
    }

        // 初始加载评论
    refreshComments();

        // 显示和隐藏评论表单
    toggleCommentButton.addEventListener('click', function () {
        // 检查用户是否已登录
        if (!token) {
            alert('请先登录后再发表评论');
            return;
        }
        
        if (commentForm.style.display === 'none' || commentForm.style.display === '') {
            commentForm.style.display = 'block';
            toggleCommentButton.textContent = '收起';
            toggleCommentButton.classList.add('active');
            commentInput.focus();
        } else {
            commentForm.style.display = 'none';
            toggleCommentButton.textContent = '添加评论';
            toggleCommentButton.classList.remove('active');
        }
    });

        // 提交评论
        function submitComment() {
            // 检查用户是否已登录
            if (!token) {
                alert('请先登录后再发表评论');
                return;
            }
        
            const commentText = commentInput.value.trim();
            const commentImage = commentImageInput.files[0];
        
            if (!commentText && !commentImage) {
                alert('请输入评论内容或选择图片');
                return;
            }

            const formData = new FormData();
            formData.append('content', commentText);
            if (commentImage) {
                formData.append('image', commentImage);
            }

            // 显示加载状态
            submitButton.disabled = true;
            submitButton.textContent = '提交中...';

            fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            .then(response => {
                // 即使返回错误也尝试解析响应
                return response.json().then(data => {
                    return {
                        ok: response.ok,
                        status: response.status,
                        data: data
                    };
                });
            })
            .then(result => {
                if (result.ok) {
                    // 成功创建评论
                    commentInput.value = '';
                    commentImageInput.value = '';
                
                    // 隐藏表单
                    commentForm.style.display = 'none';
                    toggleCommentButton.textContent = '添加评论';
                    toggleCommentButton.classList.remove('active');
                
                    // 刷新评论列表以显示新评论
                    refreshComments();
                    alert('评论发表成功！');
                } else {
                    console.error('创建评论失败:', result.data);
                    // 检查是否数据已保存但返回了错误
                    if (result.data && result.data.id) {
                        // 数据可能已保存，重新获取所有评论
                        alert('评论可能已保存，正在刷新...');
                        refreshComments();
                        commentInput.value = '';
                        commentImageInput.value = '';
                    } else {
                        alert('添加评论失败: ' + (result.data.error || result.data.message || '未知错误'));
                    }
                }
            })
            .catch(error => {
                console.error('网络错误:', error);
                alert('网络错误，请检查连接');
            })
            .finally(() => {
                // 恢复按钮状态
                submitButton.disabled = false;
                submitButton.textContent = '提交';
            });
        }

    submitButton.addEventListener('click', submitComment);

    // 监听键盘“Enter”键
    commentInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitComment();
        }
    });

    // 关闭模态框
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

        // 点击模态框外部关闭模态框
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
        // 可选：添加管理员功能按钮（如果需要）
    // 这里可以添加管理员专用的功能，比如查看所有评论（包括已删除的）
    // 或者恢复已删除的评论等功能
});