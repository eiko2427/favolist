document.getElementById('save-button').addEventListener('click', async function() {
    let url = document.getElementById('url').value;
    let time = document.getElementById('time').value;
    let memo = document.getElementById('memo').value;
  
    if (url === "" || time === "" || memo === "") {
      alert("全てのフィールドに入力してください。");
      return;
    }
  
    const userId = localStorage.getItem('user_id');
    const favDataToSend = {
      user_id: userId,
      url: url,
      time: time,
      memo: memo,
    };
  
    const tokenData = JSON.parse(localStorage.getItem('token'));
    const token = tokenData.token;
  
    try {
        console.log("Sending favorites data...");
      const favResponse = await fetch('/favorites?source=individualScreen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(favDataToSend),
      });
      console.log("Favorites data sent. Response:", favResponse);  // お気に入りデータを送った後にログ

      console.log("Sending image request...");
      const imgResponse = await fetch('/get_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });
      console.log("Image request sent. Response:", imgResponse);
      const favDataReceived = await favResponse.json();
      const imgData = await imgResponse.json();
      console.log("Received data:", { favDataReceived, imgData });
  
      if (favDataReceived.success && imgData.success) {
        alert("お気に入りと画像を正常に保存しました。");
        window.location.href = 'home.html';
      } else {
        alert("エラーが発生しました。");
      }
  
    } catch (error) {
      console.error('Error:', error);
      alert("エラーが発生しました。");
    }
  });
  