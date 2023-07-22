// Favorites の取得リクエストを送るときには、ヘッダーにトークンを含めます。
fetch('/favorites', {
    headers: {
        'x-auth-token': localStorage.getItem('token')
    }
})
.then(res => res.json())
.then(data => {
    if (!data.success) {
        alert('Failed to load favorites.');
        return;
    }

    // Display the favorites in the page here
    // ...
});
