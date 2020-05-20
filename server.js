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

const privateKey = 'my_token';

// Check Token
app.use(async (ctx, next) => {
    const token = ctx.headers.token;
    console.log(token);
    jwt.verify(token, privateKey, (err, decoded) => {
        // Token expired or undefined
        if (err) {
            // No user id and password
            if (ctx.headers.user_id === undefined && ctx.headers.password === undefined) {
                ctx.status = 555;
                return ctx.response.set({
                    'Token': token,
                    'Message': "Token expired"
                });
            }
        }
    })
    await next();
})

// POST request
router.post('/token', async (ctx, next) => {

    // Fake user
    const user = {
        name: 'marspenguine',
        id: 'Marspenguine',
        password: '123123',
    }

    // Define message and token variable
    let message = undefined;
    let token = undefined;

    // Vertify user and generate a token in session
    if (ctx.headers.token === undefined) {
        const userId = ctx.headers.user_id;
        const password = ctx.headers.password;
        if (userId === user.id && password === user.password) {
            token = jwt.sign({
                name: user.name,
                id: userId,
            }, privateKey, {
                expiresIn: '1h',
            });
            message = "Login successfully";
            ctx.status = 200;
        } else {
            ctx.status = 555;
            message = "Invalid user id or password";
        }
    }

    ctx.response.set({
        'Token': token,
        'Message': message
    });

    ctx.body = {
        'Token': token,
        'Message': message
    }
    await next();
})

// Port number setting
app.listen('8080', () => {
    console.log('service is running at port 8080');
})