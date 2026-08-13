const errorMiddleware = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload received.' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request payload too large.' });
  }

  console.error('Unhandled Error:', err);
  return res.status(err.status || 500).json({
    error: err.message || 'Internal server error.',
  });
};

const notFoundMiddleware = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Requested API endpoint not found.' });
  }
  return res.status(404).sendFile('Frontend/index.html', { root: req.app.get('ROOT_DIR') }, (err) => {
    if (err) return res.status(404).send('Page not found.');
  });
};

module.exports = { errorMiddleware, notFoundMiddleware };
