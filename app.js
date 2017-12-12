const express = require('express')
const LRU = require('lru-cache');
const app = express();
const cookieParser = require('cookie-parser');
const uuid = require('uuid/v1');

const svgCache = LRU(1000);

app.use(cookieParser());

app.get('/svg-input', (req, res) => {
  const cacheKey = req.cookies['svg-input'];
  if (!cacheKey) {
    res.send('');
  }

  const svg = svgCache.get(cacheKey);
  if (!svg) {
    res.send('');
  }
  res.clearCookie('svg-input');
  res.send(svg);
});

app.use((req, res, next) => {
  const svg = req.headers['svg-input'];
  if (svg) {
    const key = uuid();
    svgCache.set(key, svg);
    res.cookie('svg-input', key, {maxAge: 60000}); // Expires in 1 minute
  }
  next();
});

app.use(express.static('build'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));