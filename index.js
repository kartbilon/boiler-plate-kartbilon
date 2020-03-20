const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { User } = require("./models/User");


// 크롬에서 입력한 정보를 몽고db에서 다음과 같은 형식을 분석해서 가져올 수 있도록 하는 것.
// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//application/json
app.use(bodyParser.json());
//쿠기~
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => console.log('MongoDB가 잘 연결되었습니다...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World! zlzlr'))

// ./login 오타 수정
app.post('/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

            // 비밀번호까지 맞다면 토큰을 생성하기.
            user.generateToken((err, user) => {
                // status(400)은 에러를 의미함.
                if (err) return res.status(400).send(err);

                // 토큰을 저장한다. 어디에?
                // 쿠기, 로컬스토리지 여기선 쿠키에다~
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))