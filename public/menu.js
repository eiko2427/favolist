function createHamburgerMenu() {
    const header = document.querySelector('header');

    const menuToggle = document.createElement('div');
    menuToggle.id = 'menuToggle';
    menuToggle.innerHTML = `
        <input type="checkbox" />
        <span></span>
        <span></span>
        <span></span>
    `;
    header.appendChild(menuToggle);

    const menu = document.createElement('nav');
    menu.id = 'menu';

    const menuItem1 = document.createElement('a');
    menuItem1.href = 'index.html';
    menuItem1.textContent = '▶︎ お気に入り登録';
    
    const menuItem2 = document.createElement('a');
    menuItem2.href = 'home.html';
    menuItem2.textContent = '▶︎ みんなのお気に入り';
    let menuItem3;

    const menuItem4 = document.createElement('a');
    menuItem4.href = 'favorites.html';  // お気に入りページへのリンクを設定
    menuItem4.textContent = '▶︎ Myお気に入り';

if(localStorage.getItem('token')) { // ユーザーがログインしている場合
    menuItem3 = document.createElement('a');
    menuItem3.href = '#';  // hrefは'#'に変更してページ遷移を防ぐ
    menuItem3.textContent = '▶︎ ログアウト';
    menuItem3.addEventListener('click', logout);  // クリックイベントリスナーを追加
} else { // ユーザーがログインしていない場合
    menuItem3 = document.createElement('a');
    menuItem3.href = 'login.html';  // ログインページへのリンクを設定
    menuItem3.textContent = '▶︎ ログイン';
}




    menu.append(menuItem1, menuItem2, menuItem4, menuItem3);

    menu.style.display = 'none';
    header.appendChild(menu);

    menuToggle.querySelector('input').addEventListener('change', function() {
        if(this.checked) {
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
    });
}

window.onload = function () {
    createHamburgerMenu();
}
