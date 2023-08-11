document.getElementById('save-button').addEventListener('click', function() {
    let url = document.getElementById('url').value;
    let time = document.getElementById('time').value;
    let memo = document.getElementById('memo').value;

    if (url === "" || time === "" || memo === "") {
        alert("全てのフィールドに入力してください。");
        return;
    }

    let favorite = {
        url: url,
        time: time,
        memo: memo,
        userId: localStorage.getItem('user_id'), // ユーザーIDを追加
    };

    const tokenData = JSON.parse(localStorage.getItem('token'));
    const token = tokenData.token;
     // お気に入り情報をDBに保存する処理を書く
    const userId = localStorage.getItem('user_id'); 
    const favData = {
        user_id: userId, // ここにユーザーIDを設定
        url: favorite.url,
        time: favorite.time,
        memo: favorite.memo 
    };

    console.log('About to fetch...'); // 追加
    console.log('favData:', favData); // 追加
    console.log('Token:', token); // 追加

    // Send a POST request to the server
    fetch('/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  // "Bearer "プレフィクスを追加してヘッダーに認証トークンを設定
        },
        body: JSON.stringify(favData),
    })
    .then(response => {
        console.log('Fetch response:', response); // 追加
        return response.json();
    })
    .then(data => {
        console.log('Fetch data:', data); // 追加
        if (data.success) {
            alert("お気に入りに追加しました。");
            window.location.href = 'home.html'; 
        } else {
            alert("エラーが発生しました。");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
