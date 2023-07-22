// ユーザーのお気に入りだけを取得する関数
async function fetchUserFavorites(userId) {
    const token = localStorage.getItem('token'); 
    const response = await fetch(`/favorites?userId=${userId}`, { // ユーザーIDをURLパラメータとして送信
        headers: {
            'Authorization': `Bearer ${token}`  // ヘッダーに認証トークンを設定
        }
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.success) {
        const container = document.getElementById('favoritesContainer');

        for (let favorite of data.data) {
            fetch(`http://localhost:5001/link-preview?url=${encodeURIComponent(favorite.url)}`)
                .then(response => response.json())
                .then(linkPreview => {
                    const div = document.createElement('div');

                    // サムネイルを表示
                    const thumbnail = document.createElement('img');
                    thumbnail.src = linkPreview.image;  // リンクプレビューから取得した画像URLを設定
                    thumbnail.classList.add('thumbnail'); 
                    div.appendChild(thumbnail);

                    // URLを表示
                    const url = document.createElement('a');
                    url.href = favorite.url;
                    url.innerText = favorite.url;
                    div.appendChild(url);

                    // お気に入り時間を表示
                    const time = document.createElement('p');
                    time.innerText = favorite.time;
                    div.appendChild(time);

                     // お気に入りボタンを表示
                     const favButton = document.createElement('button');
                     favButton.classList.add('favorite-button');
                     favButton.innerHTML = '⭐'; 
                     favButton.dataset.active = 'false'; 
                     div.appendChild(favButton);
 

                    container.appendChild(div);

                    // ボタンのクリックイベントリスナーを追加
                    favButton.addEventListener('click', function() {
                        // ボタンのアクティブ状態を取得
                        const isActive = favButton.dataset.active === 'true';

                        if (isActive) {
                            // ボタンが既にアクティブ（お気に入り済み）ならば、非アクティブ（未お気に入り）に変更
                            favButton.style.color = 'gray';
                            favButton.dataset.active = 'false';

                            // お気に入り情報をDBから削除する処理を書く
                            // ...
                        } else {
                            // ボタンが非アクティブ（未お気に入り）ならば、アクティブ（お気に入り済み）に変更
                            favButton.style.color = 'yellow';
                            favButton.dataset.active = 'true';

                            // お気に入り情報をDBに保存する処理を書く
                            const userId = localStorage.getItem('userId'); 
                            const favData = {
                                userId: userId, // ここにユーザーIDを設定
                                postId: favorite.postid,
                                url: favorite.url,
                                time: favorite.time,
                            };
                    
                            fetch('/favorites', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(favData),
                            })
                            .then(response => response.json())
                            .then(data => console.log(data))
                            .catch((error) => console.error('Error:', error));
                        }
                    });
                });
        }
    }
}

async function fetchFavorites() {
    
    const response = await fetch('/allfavorites');
    
    if (!response.ok) {
        console.error(`Failed to fetch favorites, status: ${response.status}`);
        return;
    }

    const data = await response.json();

    if (data.success) {
        const container = document.getElementById('favoritesContainer');

        for (let favorite of data.data) {
            fetch(`http://localhost:5001/link-preview?url=${encodeURIComponent(favorite.url)}`)
                .then(response => response.json())
                .then(linkPreview => {
                    const div = document.createElement('div');

                    // サムネイルを表示
                    const thumbnail = document.createElement('img');
                    thumbnail.src = linkPreview.image;  // リンクプレビューから取得した画像URLを設定
                    thumbnail.classList.add('thumbnail'); 
                    div.appendChild(thumbnail);

                    // URLを表示
                    const url = document.createElement('a');
                    url.href = favorite.url;
                    url.innerText = favorite.url;
                    div.appendChild(url);

                    // お気に入り時間を表示
                    const time = document.createElement('p');
                    time.innerText = favorite.time;
                    div.appendChild(time);

                     // お気に入りボタンを表示
                     const favButton = document.createElement('button');
                     favButton.classList.add('favorite-button');
                     favButton.innerHTML = '⭐'; 
                     favButton.dataset.active = 'false'; 
                     div.appendChild(favButton);
 

                    container.appendChild(div);

                    // ボタンのクリックイベントリスナーを追加
                    favButton.addEventListener('click', function() {
                        // ボタンのアクティブ状態を取得
                        const isActive = favButton.dataset.active === 'true';

                        if (isActive) {
                            // ボタンが既にアクティブ（お気に入り済み）ならば、非アクティブ（未お気に入り）に変更
                            favButton.style.color = 'gray';
                            favButton.dataset.active = 'false';

                            // お気に入り情報をDBから削除する処理を書く
                            // ...
                        } else {
                            // ボタンが非アクティブ（未お気に入り）ならば、アクティブ（お気に入り済み）に変更
                            favButton.style.color = 'yellow';
                            favButton.dataset.active = 'true';

                            // お気に入り情報をDBに保存する処理を書く
                            const userId = localStorage.getItem('userId'); 
                            const favData = {
                                userId: userId, // ここにユーザーIDを設定
                                postId: favorite.postid,
                                url: favorite.url,
                                time: favorite.time,
                            };
                    
                            fetch('/favorites', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(favData),
                            })
                            .then(response => response.json())
                            .then(data => console.log(data))
                            .catch((error) => console.error('Error:', error));
                        }
                    });
                });
        }
    }
}

function login(email, password) {
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('ログインに失敗しました。');
        }
        return response.text(); // Change from response.text() to response.json()
    })
    .then(data => {
        console.log(data); // This will log the raw token
        const token = data; // This is now the token as a string
    
        // Add a condition to check if token is not undefined or empty
        if (!token) {
            throw new Error('Token is undefined or empty');
        }
    
        localStorage.setItem('token', token);
        const decodedToken = JSON.parse(window.atob(token.split('.')[1]));
        localStorage.setItem('user_id', decodedToken.user_id);
        window.location.href = '/home.html';
    })
    
    .catch(error => {
        console.error('エラー:', error);
    });
    
}


function logout() {
    // ローカルストレージからトークンとユーザーIDを削除
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // ログインページにリダイレクト
    window.location.href = 'login.html';
}

// // ログインしているユーザーのIDを取得（仮にlocalStorageから取得するとする）
// const userId = localStorage.getItem('userId');

// // ログインしているユーザーのお気に入りだけを取得
// fetchUserFavorites(userId);

// 全てのお気に入りを取得
// fetchAllFavorites();
// main.js
window.onload = function () {
    fetch('/allfavorites')
    .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to fetch favorites, status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (!data.success) {
            alert('Failed to load favorites.');
            return;
        }

        // Display the favorites in the page here
        // ...
    })
    .catch(error => {
        // Show error message
        console.error(error);
        alert('Failed to load favorites.');
    });
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }
    
    createHamburgerMenu();
};
