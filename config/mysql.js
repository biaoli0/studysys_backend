const mysql = require('mysql');
const Config = require('./index');

// Database Settings
const connectionConfig = Config.mysql;

const pool = mysql.createPool(connectionConfig);

// 
const query = (_sql, sqlParams, params) => {
    sql = mysql.format(_sql, sqlParams)
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, result) => {
            if (err) reject(err)
            resolve(result)
        })
    })
}

module.exports =query;