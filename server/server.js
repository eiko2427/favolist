require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
// const imageDir = process.env.IMAGE_DIR_PATH || '/default/path/if/not/set';
const imageDir = "/Users/shinoharataketo/favolist/saved_images/imgs";
app.use('/favolist/saved_images/imgs', express.static(imageDir));
console.log('Image Directory Path:', imageDir);
app.use(bodyParser.json());
console.log("あれは",process.env); // 環境変数を全て表示

// const API_KEY = process.env.API_KEY;
// const CUSTOM_SEARCH_ENGINE = process.env.CUSTOM_SEARCH_ENGINE;
const API_KEY = "AIzaSyATzIf1_GeiHQ24Nb-S_q2Jg-5_r6iQtRw";
const CUSTOM_SEARCH_ENGINE = "f2d36ad944b814bf5";
const saveDirPath = './saved_images'; // 画像保存先ディレクトリ
// その他のコード...


app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',  // 許可するオリジン
    credentials: true  // 資格情報を許可
  }));

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'admin001',
    password: 'admin002',
    database: 'favolist'
});
let transporter;
if (process.env.NODE_ENV === 'development') {
    transporter = nodemailer.createTransport({
        host: "smtp.mailgun.org",
        port: 587,
        auth: {
            user: process.env.MAILGUN_USER,
            pass: process.env.MAILGUN_PASS
        }
    });
} else {
    transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.f199eb10a8cc1d,
            pass: process.env.dd586688adb6ab
        }
    });
}


//ここにメモ

app.post('/register', async (req, res) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const values = [req.body.email];

    connection.query(query, values, async (error, results) => {
        if (error) return res.status(400).send('Database query failed: ' + error.message);
        if (results.length > 0) return res.status(400).send('User already registered.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
        const insertValues = [req.body.email, hashedPassword];

        connection.query(insertQuery, insertValues, function (error, results) {
            if (error) return res.status(400).send('Database query failed: ' + error.message);
            res.status(200).send('Registration successful!');
        });
    });
});


app.get('/confirmation/:token', function (req, res) {
    const query = 'SELECT * FROM verification_tokens WHERE token = ?';
    const values = [req.params.token];

    connection.query(query, values, function (error, results) {
        if (error) return res.status(400).send('Database query failed.');

        if (results.length === 0) {
            return res.status(400).send('This verification token is invalid.');
        }

        const updateQuery = 'UPDATE users SET isActive = true WHERE user_id = ?';
        const updateValues = [results[0].user_id];

        connection.query(updateQuery, updateValues, function (error, results) {
            if (error) return res.status(400).send('Database query failed.');

            // Delete verification token
            const deleteQuery = 'DELETE FROM verification_tokens WHERE token = ?';
            const deleteValues = [req.params.token];

            connection.query(deleteQuery, deleteValues, function (error, results) {
                if (error) return res.status(400).send('Database query failed.');

                res.status(200).send("Your account has been verified. Please log in.");
            });
        });
    });
});

app.get('/allfavorites', function (req, res) {
    const query = 'SELECT * FROM post';

    connection.query(query, function (error, results, fields) {
        if (error) {
            res.json({ success: false, error: error });
        } else {
            res.json({ success: true, data: results });
        }
    });
});

app.post('/login', (req, res) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const values = [req.body.email];

    connection.query(query, values, async (error, results) => {
        if (error) return res.status(400).send('Database query failed.');
        if (results.length === 0) return res.status(400).send('Invalid email or password.');

        const validPassword = await bcrypt.compare(req.body.password, results[0].password);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        const token = jwt.sign({ user_id: results[0].user_id }, 'jwtPrivateKey');
        console.log('Generated token:', token);
        res.json({ token: token }); // Change from res.send(token) to res.json({ token: token })
        // res.json({ token: token, user_id: results[0].user_id });
    });
});

app.get('/favorites', function (req, res) {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(401).send('Access denied. No token provided.');

    const bearer = bearerHeader.split(' ');
    const token = bearer[1];

    let userId;
    try {
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        console.log(decoded);
        userId = decoded.user_id;
    }
    catch (ex) {
        console.error(ex); //エラーの詳細をログに出力
        if (ex.name === 'TokenExpiredError') {
            return res.status(401).send('Token expired.'); // トークンが期限切れの場合
        } else if (ex.name === 'JsonWebTokenError') {
            return res.status(401).send('Invalid token.'); // トークンが無効の場合
        } else if (ex.name === 'NotBeforeError') {
            return res.status(401).send('Token not active.'); // トークンがまだ有効でない場合
        } else {
            return res.status(500).send('Something went wrong.'); // 予期せぬエラーの場合
        }
    }

    const query = 'SELECT * FROM favorites WHERE user_id = ? ORDER BY post_id DESC LIMIT 50';
    const values = [userId];

    connection.query(query, values, function (error, results, fields) {
        if (error) {
            res.json({ success: false, error: error });
        } else {
            res.json({ success: true, data: results });
        }
    });
});






app.post('/favorites', function (req, res) {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(401).send('Access denied. No token provided.');

    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    let userId;
    try {
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        userId = decoded.user_id;
    }
    catch (ex) {
        console.error(ex);  // ログステートメントを追加
        return res.status(400).send('Invalid token.');
    }

    const favorite = req.body;
    console.log(favorite);

    const queryPost = 'INSERT INTO post (user_id, url, time, memo, tags) VALUES (?, ?, ?, ?, ?)';
    const valuesPost = [userId, favorite.url, favorite.time, favorite.memo, favorite.tags];  // 'favorite.tags' は仮定
    const queryFavorite = 'INSERT INTO favorites (user_id, url, time, memo, postinpost_id, image_url, tags, panel_url) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)';
    const valuesFavorite = [userId, favorite.url, favorite.time, favorite.memo, favorite.postinpost_id, favorite.image_url, favorite.tags];  // 'favorite.tags' は仮定
    const action = req.body.action; // ここを変更
    // const action = req.query.action;
    
    
    
    // トランザクション開始
    connection.beginTransaction(function(err) {
        if (err) { 
            res.json({ success: false, error: err });
            return;
        }
        let lastPostId = null; 
        console.log("アクションは"+action);
        if (action === 'add'　|| action === 'register') {
            // お気に入り追加の処理（既存のコードを使用）
            function proceedWithFavoritesInsertion() {
                if (lastPostId !== null) {
                    valuesFavorite[4] = lastPostId;  // postinpost_idにlastPostIdを設定
                    console.log(lastPostId);
                }
            // sharedScreenからの遷移の時のみpanel_urlを設定
                if (req.query.source === 'sharedScreen') {
                    valuesFavorite[7] = favorite.panel_url; 
                }    
            // favoritesテーブルに挿入
                connection.query(queryFavorite, valuesFavorite, function (error, results, fields) {
                    if (error) {
                        console.log("Post Insert Error: ", error);
                        return connection.rollback(function() {
                            res.json({ success: false, error: error });
                        });
                    }
                    console.log(favorite.postinpost_id);
                        // postテーブルの対応するレコードのfavcountを増やす
                    connection.query('UPDATE post SET favcount = favcount + 1 WHERE perpost_id = ?', [favorite.postinpost_id], function(error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                res.json({ success: false, error: error });
                            });
                        }
                    });
                });
            }
    
            if (req.query.source === 'individualScreen') {
                // お気に入り登録画面からの処理　user_idを紐つける
                connection.query(queryPost, valuesPost, function (error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                            res.json({ success: false, error: error });
                        });
                    }
                    lastPostId = results.insertId;
                    valuesFavorite[4] = lastPostId;
                    proceedWithFavoritesInsertion();
                });
            } else if (req.query.source === 'sharedScreen') {
                // みんなのお気に入り画面からの処理　お気に入りした時post_idと投稿画像を紐つける
                valuesFavorite[4] = favorite.postinpost_id;  // postinpost_idにクライアントから送られてきた値を設定
                valuesFavorite[5] = favorite.image_url;
                proceedWithFavoritesInsertion();
            } else {
                proceedWithFavoritesInsertion();
            }
    
        } else if (action === 'remove') {
            // お気に入り解除の処理
            connection.query('DELETE FROM favorites WHERE user_id = ? AND postinpost_id = ?', [userId, favorite.postinpost_id], function(error, results, fields) {
                if (error) {
                    return connection.rollback(function() {
                        res.json({ success: false, error: error });
                    });
                }
    
                // favcountを減らす
                connection.query('UPDATE post SET favcount = favcount - 1 WHERE perpost_id = ?', [favorite.postinpost_id], function(error, results, fields) {
                    // ...
                });
            });
        }
    
        // トランザクションをコミット
        connection.commit(function(err) {
            if (err) {
                return connection.rollback(function() {
                    res.json({ success: false, error: err });
                });
            }
            res.json({ success: true });
        });
    });    
});



app.delete('/favorites', function (req, res) {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(401).send('Access denied. No token provided.');

    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    let userId;
    try {
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        userId = decoded.user_id;
    }
    catch (ex) {
        console.error(ex);  // ログステートメントを追加
        return res.status(400).send('Invalid token.');
    }

    const postinpost_id = req.query.post_id;
    const url = req.query.url;

    const query = 'DELETE FROM favorites WHERE user_id = ? AND post_id = ? AND url = ?';
    const values = [userId, post_id, url];
    const querypost = 'DELETE FROM post WHERE user_id = ? AND perpost_id = ? AND url = ?';
    const postvalues = [userId, postinpost_id, url];
    const checkPostExists = 'SELECT * FROM post WHERE perpost_id = ? AND user_id = ?';

    connection.query(query, values, function (error, results, fields) {
        if (error) {      
            res.json({ success: false, error: error });
        } else {
            // Check if a corresponding record exists in the 'post' table
            connection.query(checkPostExists, [postinpost_id, userId], function (error, results, fields) {                   
                if (error) {
                    res.json({ success: false, error: error });
                } else {
                    console.log("件数は"+results.length);
                    // If a record exists, then proceed with the DELETE query for 'post'
                    if (results.length > 0) {
                        connection.query(querypost, postvalues, function (error, results, fields) {
                            if (error) {
                                res.json({ success: false, error: error });
                            } else {
                                res.json({ success: true });
                            }
                        });
                    } else {
                        // If no record exists in 'post', just send success as the 'favorite' was successfully deleted
                        res.json({ success: true });
                    }
                }
            });
        }
    });
});

function makeDir(path) {
            if (!fs.existsSync(path)){
            fs.mkdirSync(path);
            }
}
    
  function makeCorrespondenceTable(correspondenceTable, originalUrl, hashedUrl) {
    correspondenceTable[originalUrl] = hashedUrl;
  }
  
  async function getImageUrl(apiKey, cseId, searchWord, saveDirPath) {
    try {
      const searchQuery = searchWord + " av";
      const res = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${searchQuery}&cx=${cseId}&key=${apiKey}&searchType=image&num=1`);
    //   console.log("検索値は"+searchWord);
    console.log("これは"+JSON.stringify(res.data, null, 2));
    console.log("検索値は"+res[res.data.items[0].link]);
      return [res.data.items[0].link];
    } catch (error) {
      console.error(error);
    }
  }
  
  async function getImage(saveDirPath, imgList) {
    makeDir(saveDirPath);
    const saveImgPath = `${saveDirPath}/imgs`;
    makeDir(saveImgPath);
    let hashedUrl = null;  // hashedUrlの初期値をnullに設定

    try {
        const url = imgList[0];
         // 正規表現でURLから拡張子を取得
         const matches = url.match(/\.(jpg|png|gif|bmp|jpeg)(\?.+)?$/i);
         if (!matches) {
             console.error("Unknown file extension");
             return null;
         }
         const extension = matches[1];
        hashedUrl = crypto.createHash('sha256').update(url).digest('hex');
        // 不要な文字が拡張子に含まれないように保存
        const path = `${saveImgPath}/${hashedUrl}.${extension}`;

        const img = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(path, Buffer.from(img.data), 'binary');
        
        console.log("ハッシュ", hashedUrl);
        makeCorrespondenceTable({}, url, hashedUrl);
    } catch (error) {
        console.error("failed to download images.", error);
    }

    return hashedUrl;  // hashedUrlを返す
}

app.post('/get_image', async function (req, res) {
    try {
        const url = req.body.url;
        const searchword = req.body.partNumber;
        console.log("検索品番は"+searchword);
        const imgList = await getImageUrl(API_KEY, CUSTOM_SEARCH_ENGINE, searchword, saveDirPath);
        const hashedUrl = await getImage(saveDirPath, imgList);
        
        console.log("キーの値", url);
        console.log("カスタムサーチエンジンは", CUSTOM_SEARCH_ENGINE);
    
        // SQLクエリを用いてpostテーブルを更新
        const updatePostQuery = "UPDATE post SET image_url = ? WHERE url = ?";
        await connection.query(updatePostQuery, [hashedUrl, url]);
        
        // SQLクエリを用いてfavoritesテーブルを更新
        const updateFavoritesQuery = "UPDATE favorites SET image_url = ? WHERE url = ?";
        await connection.query(updateFavoritesQuery, [hashedUrl, url]);
        
        res.json({ success: true });
    } catch (error) {
        console.error("An error occurred:", error);
        res.json({ success: false });
    }
});
app.post('/get_imagepanel', async function (req, res) {
    try {
        const partNumber = req.body.partNumber;
        const searchQuery = partNumber + " maxjav image";
        // const searchQuery = partNumber;
        const url = req.body.url;
        const imgList = await getImageUrl(API_KEY, CUSTOM_SEARCH_ENGINE, searchQuery, saveDirPath);
        const hashedUrl = await getImage(saveDirPath, imgList);
        
        console.log("panelの値", searchQuery);
    
        // SQLクエリを用いてpostテーブルを更新
        const updatePostQuery = "UPDATE post SET panel_url = ? WHERE url = ?";
        await connection.query(updatePostQuery, [hashedUrl, url]);
        
        // SQLクエリを用いてfavoritesテーブルを更新
        const updateFavoritesQuery = "UPDATE favorites SET panel_url = ? WHERE url = ?";
        await connection.query(updateFavoritesQuery, [hashedUrl, url]);
        
        res.json({ success: true });
    } catch (error) {
        console.error("An error occurred:", error);
        res.json({ success: false });
    }
});
app.get('/get_tags', function (req, res) {
    const query = 'SELECT tag_name FROM tag';

    connection.query(query, function (error, results, fields) {
        if (error) {
            res.json({ success: false, error: error });
        } else {
            const tags = results.map(result => result.tag_name);
            res.json({ success: true, tags: tags });
        }
    });
});






app.listen(3000, function () {
    console.log('App is listening on port 3000');
});
