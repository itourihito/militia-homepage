const dotenv  = require('dotenv');
if (process.env.NODE_ENV !== 'production') {
    const result = dotenv.config();
    if (result.error) {
        console.error("Error loading .env file:", result.error);
    } else {
        console.log("Environment variables loaded:", result.parsed);
    }
}

const express = require("express");
const nodemailer = require('nodemailer');
const {engine}  = require("express-handlebars");
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const config = require('./config'); 
const app = express();

const PORT = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";

const db = mysql.createPool({
    connectionLimit: 10,
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name
})
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('hbs', engine({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers:{
        breaklines:function(text){
            let escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // XSS対策
            return escapedText.replace(/(\r\n|\n|\r)/gm, '<br>');
        }

    }
}
    
));

app.set('view engine', 'hbs');

app.use(express.static('public'));

app.get("/",(req,res)=>{
    let queryNews = 'SELECT * FROM news ORDER BY date DESC LIMIT 3'; // ニュースを取得するSQLクエリ
    let queryStreamers = 'SELECT * FROM livers where pick = 1'; // ストリーマーを取得するSQLクエリ
    db.query(queryNews, (err, newsResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
        db.query(queryStreamers, (err, streamersResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Internal Server Error");
            }
            res.render('home',{
                news: newsResults,
                livers: streamersResults,
                style:'home',
                script:"home"
            });
        });
    })
});
app.get("/livers",(req,res)=>{
    db.query('SELECT * FROM livers', (error, results, fields) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
        res.render('livers', { 
            livers: results,
            style:"livers"

        });
      });
})
app.get("/liver/:name_id",(req,res)=>{
    const liverId = req.params.name_id;
    let query = 'SELECT * FROM livers WHERE name_id = ?';
    db.query(query,[liverId],(err,result)=>{
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
        res.render("liver",{
            liver:result[0],
            style:"liver"
        })
    })
    
})
app.get("/news",(req,res)=>{
    db.query('SELECT * FROM news ORDER BY date DESC', (error, results, fields) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
        res.render('news', { 
            news: results,
            style:"news"
        });
    })
})
app.get("/topic/:id",(req,res)=>{
    const topicId = req.params.id;
    let query = 'SELECT * FROM news WHERE id = ?';
    db.query(query,[topicId],(err,result)=>{
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
        res.render("topic",{
            news: result[0],
            style: "topic"
        });
    });
    
});
app.get("/audition",(req,res)=>{
    res.render("audition",{
        style:"audition"
    });
});
app.post('/audition', (req, res) => {
    const { name, email, message } = req.body;
    const applicantMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '応募の確認',
        text: `こんにちは ${name}さん。\n\nあなたの応募を受け付けました。`
    };

    const companyMailOptions = {
        from: config.email.user,
        to: config.email.user,
        subject: '新しい求人応募',
        text: `こんにちは。\n\n${name}さんからの新しい応募がありました。\n\n${email}`
    };
    let query = 'INSERT INTO auditions (name, email, message) VALUES (?, ?, ?)';
    
    db.query(query, [name, email, message], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
    transporter.sendMail(applicantMailOptions, (error, info) => {
        if (error) {
            console.log('メール送信エラー:', error);
        } else {
            console.log('メール送信成功:', info.response);
        }
    });
    transporter.sendMail(companyMailOptions, (error, info) => {
        if (error) {
            console.log('会社へのメール送信エラー:', error);
        }
    });
      res.redirect('/auditionSuc');
    });
});
app.get("/auditionSuc",(req,res)=>{
    res.render("auditionSuc",{
        style:"auditionSuc"
    })
})
app.get("/contact",(req,res)=>{
    res.render("contact",{
        style:"contact"
    })
})
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    const applicantMailOptions = {
        from: config.email.user,
        to: email,
        subject: 'メッセージ送信の確認',
        text: `こんにちは ${name}さん。\n\nあなたのメッセージを受け付けました。`
    };

    const companyMailOptions = {
        from: config.email.user,
        to: config.email.user,
        subject: '新しいメッセージ',
        text: `こんにちは。\n\n${name}さんからの新しいメッセージがありました。\n\n${email}`
    };
    let query = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
    
    db.query(query, [name, email, message], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }
      transporter.sendMail(applicantMailOptions, (error, info) => {
        if (error) {
            console.log('メール送信エラー:', error);
        } else {
            console.log('メール送信成功:', info.response);
        }
    });
    transporter.sendMail(companyMailOptions, (error, info) => {
        if (error) {
            console.log('会社へのメール送信エラー:', error);
        }
    });
      res.redirect('/contactSuc');
    });
});
app.get("/contactSuc",(req,res)=>{
    res.render("contactSuc",{
        style:"contactSuc"
    })
})
app.listen(PORT,() => console.log("サーバー起動"));



