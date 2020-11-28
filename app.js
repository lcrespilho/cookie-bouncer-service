require('@google-cloud/debug-agent').start({ allowExpressions: true });
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser()); // req headers cookies => req.cookies

app.post('/', (req, res) => {
  let bodyStr = '';
  req.on('data', chunk => bodyStr += chunk);
  req.on('end', () => {
    let rewriteRequests = JSON.parse(bodyStr);
    console.log('cookie rewrite requests:', rewriteRequests);
    rewriteRequests.forEach(cookie => {
      if (typeof cookie !== 'object') return;
      if (!cookie.name) return;
      if (cookie.value) {
        res.cookie(cookie.name, cookie.value, cookie.options);
      } else if (req.cookies[cookie.name]) {
        res.cookie(cookie.name, req.cookies[cookie.name], {
          path: '/',
          domain: 'lourenco.tk',
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 anos
          sameSite: 'None',
          secure: true
        });
      }
    });
    res.sendStatus(204);
  });
});

const PORT = process.env.PORT || '8080';
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}