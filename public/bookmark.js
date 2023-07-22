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
        userId: localStorage.getItem('userId'), // ユーザーIDを追加
    };

    const token = localStorage.getItem('token');

    // Send a POST request to the server
    fetch('/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify(favorite),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("お気に入りに追加しました。");
        } else {
            alert("エラーが発生しました。");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
