const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  repo: { type: String, required: true },
  branch: { type: String, default: 'main' },
  owner: { type: String, required: true },
  ownerToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// TTL index → MongoDB auto-deletes expired docs
shareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Share', shareSchema);
