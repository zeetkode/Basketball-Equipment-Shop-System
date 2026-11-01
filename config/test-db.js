const db = require('./db');

db.query('SHOW TABLES', (err, results) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database tables:');
        console.log(results);
    }

    db.end();
});