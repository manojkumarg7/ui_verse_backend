function protect(_req, res) {
  res.status(501).json({ success: false, message: 'Auth not implemented yet' });
}

module.exports = { protect };
