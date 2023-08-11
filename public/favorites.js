fetch('/favorites', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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
