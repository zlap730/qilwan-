document.addEventListener('DOMContentLoaded', () => {
    loadPosts(); // 页面加载时加载作品
});

// 发布作品
async function publishPost() {
    const postContent = document.getElementById('postContent').value.trim();

    if (!postContent) {
        alert('作品内容不能为空！');
        return;
    }

    try {
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
        const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.split('=')[1])) : null;

        if (!user || !user.id) {
            alert('请先登录后再发布作品！');
            return;
        }

        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({ content: postContent, userId: user.id })
        });

        if (!response.ok) {
            throw new Error('发布失败，请稍后重试！');
        }

        alert('作品发布成功！');
        document.getElementById('postContent').value = ''; // 清空输入框
        loadPosts(); // 重新加载作品
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '发布失败，请稍后重试！');
    }
}

// 加载作品
async function loadPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/posts');
        if (!response.ok) {
            throw new Error('加载作品失败，请稍后重试！');
        }

        const posts = await response.json();
        const postsSection = document.getElementById('postsSection');
        postsSection.innerHTML = '<h3>作品展示</h3>'; // 清空并重新加载标题

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <p><strong>${post.username}</strong> 发布于 ${new Date(post.createdAt).toLocaleString()}</p>
                <p>${post.content}</p>
                <button onclick="showComments(${post.id})">查看评论</button>
                <div id="comments-${post.id}" class="comments"></div>
                <textarea id="commentInput-${post.id}" placeholder="写下你的评论..."></textarea>
                <button onclick="addComment(${post.id})">评论</button>
            `;
            postsSection.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '加载作品失败，请稍后重试！');
    }
}

// 添加评论
async function addComment(postId) {
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const commentContent = commentInput.value.trim();

    if (!commentContent) {
        alert('评论内容不能为空！');
        return;
    }

    try {
        const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
        const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.split('=')[1])) : null;

        if (!user || !user.id) {
            alert('请先登录后再评论！');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({ content: commentContent, userId: user.id })
        });

        if (!response.ok) {
            throw new Error('评论失败，请稍后重试！');
        }

        alert('评论成功！');
        commentInput.value = ''; // 清空评论输入框
        showComments(postId); // 重新加载评论
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '评论失败，请稍后重试！');
    }
}

// 显示评论
async function showComments(postId) {
    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`);
        if (!response.ok) {
            throw new Error('加载评论失败，请稍后重试！');
        }

        const comments = await response.json();
        const commentsSection = document.getElementById(`comments-${postId}`);
        commentsSection.innerHTML = ''; // 清空评论区域

        comments.forEach(comment => {
            const commentElement = document.createElement('p');
            commentElement.textContent = `${comment.username}: ${comment.content}`;
            commentsSection.appendChild(commentElement);
        });
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '加载评论失败，请稍后重试！');
    }
}

// 后端 API 路由
app.post('/api/posts', async (req, res) => {
    const { content, userId } = req.body;

    if (!content || !userId) {
        return res.status(400).json({ message: '内容和用户 ID 不能为空' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO posts (content, user_id) VALUES (?, ?)',
            [content, userId]
        );

        const [post] = await db.execute('SELECT * FROM posts WHERE id = ?', [result.insertId]);
        res.status(201).json({ message: '作品发布成功', post: post[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const [posts] = await db.execute(`
            SELECT posts.id, posts.user_id, users.username, posts.content, posts.created_at
            FROM posts
            JOIN users ON posts.user_id = users.id
            ORDER BY posts.created_at DESC
        `);

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
});