const { all } = require("axios");

// ユーザーのお気に入りだけを取得する関数
async function fetchUserFavorites(userId) {
    let storedItem = localStorage.getItem('token');
    let parsedItem = JSON.parse(storedItem);  // ローカルストレージから取得したアイテムをJSONとしてパース
    let token = parsedItem.token;  // JSONからトークンを取得
    console.log('Retrieved token:', token);  // トークンが正しく取得できていることを確認
    const response = await fetch(`/favorites?userId=${userId}`, { 
        headers: {
            'Authorization': `Bearer ${token}`  // "Bearer "プレフィクスを追加してヘッダーに認証トークンを設定
        }
    });
    
    console.log('Response:', response);  // レスポンスをログ出力

    if (!response.ok) {
        const message = await response.text();  // レスポンス本文を取得
        throw new Error(`HTTP error! status: ${response.status}, message: ${message}`);
    }
    const data = await response.json();
    console.log(data);
    if (data.success) {
        const container = document.getElementById('favoritesContainer');

        for (let favorite of data.data) {
            fetch(`http://localhost:5001/link-preview?url=${encodeURIComponent(favorite.url)}`)
                .then(response => response.json())
                .then(linkPreview => {
                    const div = document.createElement('div');

                    // サムネイルを表示
                    const thumbnail = document.createElement('img');
                    thumbnail.src = `http://localhost:3000/favolist/saved_images/imgs/${favorite.image_url}.jpg`;
                    console.log("サムネイル", thumbnail.src);
                    thumbnail.classList.add('thumbnail'); 

                    const panelThumbnail = document.createElement('img');
                    panelThumbnail.src = `http://localhost:3000/favolist/saved_images/imgs/${favorite.panel_url}.jpg`;
                    panelThumbnail.classList.add('panel-thumbnail');

                    // 画像をクリックしたときに拡大・縮小する機能
                    panelThumbnail.addEventListener('click', function() {
                        if (panelThumbnail.classList.contains('panel-thumbnail-expanded')) {
                            panelThumbnail.classList.remove('panel-thumbnail-expanded');
                        } else {
                            panelThumbnail.classList.add('panel-thumbnail-expanded');
                        }
                    });

                    // divにCSSクラスを追加して水平に並べるスタイルを適用
                    div.classList.add('horizontal-container');

                    // サムネイルとpanel_urlを追加するための新しいdivを作成
                    const imgDiv = document.createElement('div');
                    imgDiv.classList.add('img-container');
                    imgDiv.appendChild(thumbnail);
                    imgDiv.appendChild(panelThumbnail);
                    div.appendChild(imgDiv);

                    // URL、お気に入り時間、タグ、お気に入りボタンを追加するための新しいdivを作成
                    const infoDiv = document.createElement('div');
                    infoDiv.classList.add('info-container');


                    // URLを表示
                    const url = document.createElement('a');
                    url.href = favorite.url;
                    url.innerText = favorite.url;
                    infoDiv.appendChild(url);
                    // お気に入り時間を表示
                    const time = document.createElement('p');
                    time.innerText = favorite.time;
                    // div.appendChild(time);
                    // タグを表示
                    const tags = document.createElement('p');
                    tags.innerText = favorite.tags;
                    infoDiv.appendChild(tags);

                    // 削除ボタンを追加
                    const deleteButton = document.createElement('button');
                    deleteButton.innerHTML = '削除';
                    deleteButton.classList.add('btn', 'btn-danger', 'small-delete-button');
                    deleteButton.addEventListener('click', async () => {
                        const response = await fetch(`/favorites?userId=${userId}&post_id=${encodeURIComponent(favorite.post_id)}&url=${encodeURIComponent(favorite.url)}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                        });
                        

                        if (!response.ok) {
                            const message = await response.text();  // レスポンス本文を取得
                            throw new Error(`HTTP error! status: ${response.status}, message: ${message}`);
                        } else {
                            div.remove();  // 成功した場合、該当のお気に入りを画面から削除
                        }
                    });
                    div.appendChild(infoDiv);
                    div.prepend(deleteButton);
                    container.appendChild(div);

                });
        }
    }
}
//全お気に入りを表示
async function fetchFavorites(userId) {
    
    let storedItem = localStorage.getItem('token');
    let parsedItem = storedItem ? JSON.parse(storedItem) : null;  // ローカルストレージから取得したアイテムをJSONとしてパース
    let token = parsedItem ? parsedItem.token : null;  // JSONからトークンを取得

    const response = await fetch('/allfavorites', {
        headers: token ? {
            'Authorization': `Bearer ${token}`  // "Bearer "プレフィクスを追加してヘッダーに認証トークンを設定
        } : {}
    });
    console.log('Response:', response); 
    if (!response.ok) {
        const message = await response.text();  // レスポンス本文を取得
        throw new Error(`HTTP error! status: ${response.status}, message: ${message}`);
    }
    
    const data = await response.json();
    console.log("データ",data);
    if (data.success) {
        const container = document.getElementById('favoritesContainer');

        for (let favorite of data.data) {
            fetch(`http://localhost:5001/link-preview?url=${encodeURIComponent(favorite.url)}`)
                .then(response => response.json())
                .then(linkPreview => {
                    const div = document.createElement('div');

                    // サムネイルを表示
                    const thumbnail = document.createElement('img');
                    thumbnail.src = `http://localhost:3000/favolist/saved_images/imgs/${favorite.image_url}.jpg`;
                    console.log("サムネイル", thumbnail.src);
                    thumbnail.classList.add('thumbnail'); 

                    const panelThumbnail = document.createElement('img');
                    panelThumbnail.src = `http://localhost:3000/favolist/saved_images/imgs/${favorite.panel_url}.jpg`;
                    panelThumbnail.classList.add('panel-thumbnail');

                    // 画像をクリックしたときに拡大・縮小する機能
                    panelThumbnail.addEventListener('click', function() {
                        if (panelThumbnail.classList.contains('panel-thumbnail-expanded')) {
                            panelThumbnail.classList.remove('panel-thumbnail-expanded');
                        } else {
                            panelThumbnail.classList.add('panel-thumbnail-expanded');
                        }
                    });

                    // divにCSSクラスを追加して水平に並べるスタイルを適用
                    div.classList.add('horizontal-container');

                    // サムネイルとpanel_urlを追加するための新しいdivを作成
                    const imgDiv = document.createElement('div');
                    imgDiv.classList.add('img-container');
                    imgDiv.appendChild(thumbnail);
                    imgDiv.appendChild(panelThumbnail);
                    div.appendChild(imgDiv);

                    // URL、お気に入り時間、タグ、お気に入りボタンを追加するための新しいdivを作成
                    const infoDiv = document.createElement('div');
                    infoDiv.classList.add('info-container');


                    // URLを表示
                    const url = document.createElement('a');
                    url.href = favorite.url;
                    url.innerText = favorite.url;
                    infoDiv.appendChild(url);
                    // お気に入り時間を表示
                    const time = document.createElement('p');
                    time.innerText = favorite.time;
                    // div.appendChild(time);
                    // タグを表示
                    const tags = document.createElement('p');
                    tags.innerText = favorite.tags;
                    infoDiv.appendChild(tags);
                    //ここ検討中
                    // if (userId === favorite.user_id) {
                    // }else{
                    // お気に入りボタンを表示
                    const favButton = document.createElement('button');
                    favButton.classList.add('favorite-button');
                    favButton.innerHTML = '⭐'; 
                    favButton.dataset.active = 'false'; 
                    infoDiv.appendChild(favButton);
                    // }
                    // 隠し要素としてpost_idを保持
                    const hiddenPostId = document.createElement('input');
                    hiddenPostId.type = 'hidden';
                    hiddenPostId.value = favorite.perpost_id;  // post_idを設定
                    hiddenPostId.name = 'hiddenPostId';
                    div.appendChild(hiddenPostId);
                    container.appendChild(div);
                    // 隠し要素としてimage_urlを保持
                    const hiddenImageUrl = document.createElement('input');
                    hiddenImageUrl.type = 'hidden';
                    hiddenImageUrl.value = favorite.image_url;  // image_urlを設定
                    hiddenImageUrl.name = 'hiddenImageUrl';
                    div.appendChild(hiddenImageUrl);
                    div.appendChild(infoDiv);
                    container.appendChild(div);

                    // ボタンのクリックイベントリスナーを追加
                    favButton.addEventListener('click', function() {
                        // ボタンのアクティブ状態を取得
                        const isActive = favButton.dataset.active === 'true';
                        const action = isActive ? 'remove' : 'add'; // お気に入り状態によってアクションを変える
                        const endpoint = `/favorites?source=sharedScreen&action=${action}`; // APIエンドポイントにactionパラメータを追加
                        
                        favButton.style.color = isActive ? 'gray' : 'yellow';
                        favButton.dataset.active = isActive ? 'false' : 'true';

                            // お気に入り情報をDBに保存する処理を書く
                            const userId = localStorage.getItem('user_id'); 
                            const favData = {
                                user_id: userId, // ここにユーザーIDを設定
                                post_id: favorite.postid,
                                url: favorite.url,
                                time: favorite.time,
                                postinpost_id: favorite.perpost_id,
                                image_url: favorite.image_url,
                                panel_url: favorite.panel_url
                            };
                            favData.action = action;
                            let storedItem = localStorage.getItem('token');
                            let parsedItem = JSON.parse(storedItem);  // ローカルストレージから取得したアイテムをJSONとしてパース
                            let token = parsedItem.token;  // JSONからトークンを取得
                            
                            // fetch(endpoint, {
                            //     method: 'POST',
                            //     headers: {
                            //         'Content-Type': 'application/json',
                            //         'Authorization': `Bearer ${token}`  // "Bearer "プレフィクスを追加してヘッダーに認証トークンを設定
                            //     },
                            //     body: JSON.stringify(favData),
                            // })

                            fetch('/favorites?source=sharedScreen', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`  // "Bearer "プレフィクスを追加してヘッダーに認証トークンを設定
                                },
                                body: JSON.stringify(favData),
                            })

                            .then(response => response.json())
                            .then(data => console.log(data))
                            .catch((error) => console.error('Error:', error));
                        
                    });
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                });
        }
    }
}

async function getPostIdFromServer(url) {
    // APIリクエストを行い、post_idを取得
    const response = await fetch(`/get-post-id?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data.post_id;
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
        const errorMessageDiv = document.getElementById('errorMessage');
        errorMessageDiv.textContent = 'ログインに失敗しました。';  // または error.message で具体的なエラーメッセージを表示
    });
    
    
}


function logout() {
    // ローカルストレージからトークンとユーザーIDを削除
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    
    // ログインページにリダイレクト
    window.location.href = 'login.html';
}

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

    document.getElementById('sortTitle').innerText = "新着順";


    document.getElementById('new-posts-tab').addEventListener('click', function() {
        document.getElementById('sortTitle').innerText = "新着順";
    });
    document.getElementById('popular-posts-tab').addEventListener('click', function() {
        document.getElementById('sortTitle').innerText = "人気順";
    });
};
