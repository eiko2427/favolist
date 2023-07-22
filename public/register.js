// register.js
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Check if email or password is empty
    if (!email || !password) {
        alert('メールアドレスとパスワードを入力してください。');
        return;
    }
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => {
                throw new Error(text);
            });
        }
        return res.text();
    })
    .then(response => {
        alert('Registration successful!');
    })
    .catch(error => {
        // Show error message
        alert(error);
    });
});
});
