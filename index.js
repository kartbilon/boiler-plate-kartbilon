const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')

const config = require('./config/key');

const { User } = require("./models/User");


// 크롬에서 입력한 정보를 몽고db에서 다음과 같은 형식을 분석해서 가져올 수 있도록 하는 것.
// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//application/json
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => console.log('MongoDB가 잘 연결되었습니다...'))
 .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World! zlzlr'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.post('/register', (req, res) => {

    // 회원 가입 할때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.
    
    // req.body 안에는 다음과 같은 데이터가 저장되어 있다.
    // {
    //     id: "hello",
    //     password: "123"
    // }
    const user = new User(req.body)

    // status(200)은 성공했다는 의미.
    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
})