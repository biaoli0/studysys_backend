const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const jwt = require('jsonwebtoken');

const session = require('koa-session');

const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

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

// Vertify user and generate a token in session
app.use(async (ctx, next) => {
    userId = ctx.headers.userId;
    password = ctx.headers.password;

    if (userId === user.id && password === user.password) {
        const token = jwt.sign({
            name: user.name,
            id: user.id,
        }, 'my_token', {
            expiresIn: '2h'
        });
        ctx.session.token = token;
        ctx.status = 200;
    } else {
        ctx.status = 555;
    }

    await next();
})

// GET request
router.get('/', async (ctx, next) => {
    ctx.body = {
        token: ctx.session.token,
    };
    await next();
})

// Port number setting
app.listen('8080', () => {
    console.log('service is running at port 8080');
})