require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// Validate required environment variables
const requiredEnvVars = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'SESSION_SECRET', 'FRONTEND_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['set-cookie']
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: process.env.NODE_ENV === 'production',
  cookie: {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT}`}/auth/github/callback`,
  scope: ['repo'],
  userAgent: 'GitShare'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, {
    accessToken,
    profile: {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      photos: profile.photos
    }
  });
}));

// Passport serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// In-memory store for shares
const shares = new Map();

// Trust proxy in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Routes
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(200).json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    id: req.user.profile.id,
    username: req.user.profile.username,
    avatar: req.user.profile.photos?.[0]?.value
  });
});

app.get('/api/repos', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const octokit = new Octokit({ auth: req.user.accessToken });
  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      visibility: 'all',
      affiliation: 'owner,collaborator',
      per_page: 100
    });
    res.json(data);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

app.post('/api/share', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { repo, expiresInHours = 24 } = req.body;
  if (!repo || !repo.includes('/')) {
    return res.status(400).json({ error: 'Invalid repository format' });
  }

  const shareToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  shares.set(shareToken, {
    repo,
    expiresAt,
    owner: req.user.profile.id,
    ownerToken: req.user.accessToken,
    createdAt: new Date()
  });

  res.json({
    shareToken,
    shareLink: `${process.env.FRONTEND_URL}/share/${shareToken}`,
    expiresAt: expiresAt.toISOString()
  });
});

app.get('/api/repo-content/:token', async (req, res) => {
  const share = shares.get(req.params.token);
  if (!share) {
    return res.status(404).json({ error: 'Share link not found' });
  }

  if (share.expiresAt < new Date()) {
    shares.delete(req.params.token);
    return res.status(410).json({ error: 'Share link expired' });
  }

  try {
    const [owner, repo] = share.repo.split('/');
    const octokit = new Octokit({ auth: share.ownerToken });
    
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: req.query.path || '',
      ref: req.query.ref || 'main'
    });

    res.json(data);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch repository content' });
  }
});

app.get('/api/repos/:owner/:repo/branches', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { owner, repo } = req.params;
  const octokit = new Octokit({ auth: req.user.accessToken });

  try {
    const { data } = await octokit.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });
    const branches = data.map(branch => ({ name: branch.name }));
    res.json(branches);
  } catch (error) {
    console.error('GitHub API error (branches):', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect(process.env.FRONTEND_URL);
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GitHub callback: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/auth/github/callback`);
});