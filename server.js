const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const jwt = require('jsonwebtoken');
const session = require('koa-session');

const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// CORS
const cors = require('@koa/cors');
app.use(cors());

// Router allowedMethods
app.use(router.routes()).use(router.allowedMethods());

// Session config
app.keys = ['secret'];
const CONFIG = {
    key: 'koa:sess',
    maxAge: 1000 * 60 * 60,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
};
app.use(session(CONFIG, app));

// Fake user
const user = {
    name: 'marspenguine',
    id: 'Marspenguine',
    password: '123123',
}

const privateKey = 'my_token';

// Check Token
app.use(async (ctx, next) => {
    const token = ctx.headers.token;
    jwt.verify(token, privateKey, (err, decoded) => {
        // Token expired or undefined
        if (err) {
            // No user id and password
            if (ctx.headers.user_id === undefined && ctx.headers.password === undefined) {
                ctx.status = 555;
                ctx.session.message = "Token expired";
                return;
            }
        }
    })
    await next();
})

// Vertify user and generate a token in session
app.use(async (ctx, next) => {
    if (ctx.headers.token === undefined) {
        const userId = ctx.headers.user_id;
        const password = ctx.headers.password;
        if (userId === user.id && password === user.password) {
            const token = jwt.sign({
                name: user.name,
                id: userId,
            }, privateKey, {
                expiresIn: '1h',
            });
            ctx.session.token = token;
            ctx.status = 200;
            ctx.session.message = "登录成功";
        } else {
            ctx.status = 555;
            ctx.session.message = "用户密码错误";
            return;
        }
    }
    await next();
})

// POST request
router.post('/', async (ctx, next) => {
    ctx.body = {
        token: ctx.session.token,
        message: ctx.session.message,
    };
    await next();
})

// Port number setting
app.listen('8080', () => {
    console.log('service is running at port 8080');
})