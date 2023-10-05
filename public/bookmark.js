// 品番を抜き取る関数
function extractPartNumber(url) {
    const regex = /[a-zA-Z]{3,5}-\d{1,3}/g;
    const matched = url.match(regex);
    return matched ? matched[0] : '品番が見つかりません';
  }

document.getElementById('save-button').addEventListener('click', async function() {
    let url = document.getElementById('url').value;
    // let time = document.getElementById('time').value;
    // let memo = document.getElementById('memo').value;
    let time = null;
    let memo = null;
    let tags = document.getElementById('tags').value;
  
    if (url === "" || tags === "") {
      alert("全てのフィールドに入力してください。");
      return;
    }
  // 品番を抜き取ります
  const partNumber = extractPartNumber(url);

  console.log(`抜き取られた品番: ${partNumber}`); // コンソールで抜き取られた品番を確認

    const userId = localStorage.getItem('user_id');
    const favDataToSend = {
      user_id: userId,
      url: url,
      time: time,
      memo: memo,
      tags: tags,
      partNumber: partNumber // 品番もデータとして送る場合
    };
    favDataToSend.action = 'register';
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
        console.log("Favorites data sent. Response:", favResponse);
    
        console.log("Sending image request...");
        const imgResponse = await fetch('/get_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ partNumber: partNumber, url: url }),
        });
        console.log("Image request sent. Response:", imgResponse);
    
        console.log("Sending panel image request...");
        const panelImgResponse = await fetch('/get_imagepanel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ partNumber: partNumber, url: url }),  // 品番とURLを送る
        });
        console.log("Panel image request sent. Response:", panelImgResponse);
    
        const favDataReceived = await favResponse.json();
        const imgData = await imgResponse.json();
        const panelImgData = await panelImgResponse.json();  // 追加
        console.log("Received data:", { favDataReceived, imgData, panelImgData });  // 追加
    
        if (favDataReceived.success && imgData.success && panelImgData.success) {  // 追加
            // if (favDataReceived.success && imgData.success ) {  // コメントアウト
            alert("お気に入りと画像、パネル画像を正常に保存しました。");  // 文言変更
            window.location.href = 'home.html';
        } else {
            alert("エラーが発生しました。");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("エラーが発生しました。");
    }
    
  });

  document.addEventListener('DOMContentLoaded', async () => {
    let tagSuggestions = [];

    // サーバーからタグを取得
    try {
        const response = await fetch('/get_tags');
        console.log('Response:', response);  // レスポンスの確認用に追加
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                tagSuggestions = data.tags || [];  // tags が undefined なら空の配列に
            } else {
                console.error('Failed to fetch tags: Server-side error');
            }
        } else {
            const message = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${message}`);
        }
    } catch (error) {
        console.error('Error while fetching tags:', error);
    }
    

const tagInput = document.getElementById('tags');
const tagSuggestionsBox = document.getElementById('tag-suggestions');

// 一度クリックされた後でも全ての選択肢を見れるようにするため、
// readOnly 属性を外す処理をここで登録
tagInput.addEventListener('focus', () => {
    tagInput.readOnly = false;
    tagInput.value = '';  // フォーカスされたらフォームの値をクリア
    showSuggestions();    // そして選択肢を再表示
});

const showSuggestions = () => {
    const inputValue = tagInput.value.toLowerCase();
    tagSuggestionsBox.innerHTML = '';

    tagSuggestions.forEach(tag => {
        if (tag.toLowerCase().startsWith(inputValue)) {
            const suggestion = document.createElement('div');
            suggestion.textContent = tag;
            suggestion.classList.add('tag-suggestion-item');

            suggestion.addEventListener('click', () => {
                tagInput.value = tag;
                tagInput.readOnly = true;  // 一度選択したら読み取り専用にする
                tagSuggestionsBox.innerHTML = '';
            });

            tagSuggestionsBox.appendChild(suggestion);
        }
    });
};

tagInput.addEventListener('input', showSuggestions);
tagInput.addEventListener('focus', showSuggestions);  // フォーカスされたら選択肢を表示

    
    
});

  