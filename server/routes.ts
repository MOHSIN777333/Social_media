import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { db, User } from './db';

const router = Router();

// Configure image uploads
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper to determine current user
function getActiveUser(req: Request): User | null {
  const customUserId = req.headers['x-user-id'] as string;
  if (customUserId) {
    const user = db.getUserById(customUserId);
    if (user) return user;
  }
  return null;
}

// Middleware helper to require authentication
function requireAuth(req: Request, res: Response): User | null {
  const user = getActiveUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return null;
  }
  return user;
}

// -------------------------------------------------------------
// Auth Routes
// -------------------------------------------------------------
router.get('/auth/me', (req: Request, res: Response) => {
  const user = getActiveUser(req);
  res.json({ user });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if (!email && !username) {
    return res.status(400).json({ error: 'Email or username is required' });
  }

  const users = db.getUsers();
  const matched = users.find(
    (u) =>
      (email && u.email.toLowerCase() === email.toLowerCase()) ||
      (username && u.username.toLowerCase() === username.toLowerCase())
  );

  if (matched) {
    if (matched.password && password) {
      const isValid = bcrypt.compareSync(password, matched.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      }
    }
    return res.json({ user: matched });
  }

  // Auto-provision if not found for easy testing
  const name = (username || email.split('@')[0]);
  const hashedPassword = password ? bcrypt.hashSync(password, 10) : undefined;
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    username: username || email.split('@')[0],
    email: email || `${username}@example.com`,
    password: hashedPassword,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    bio: 'Community member',
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  res.json({ user: newUser });
});

router.post('/auth/google', (req: Request, res: Response) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.json({ user: existing });
  }

  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name || username.charAt(0).toUpperCase() + username.slice(1),
    username,
    email: email.toLowerCase(),
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || username)}`,
    bio: 'Google authenticated member',
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  res.status(201).json({ user: newUser });
});

router.post('/auth/github', (req: Request, res: Response) => {
  const { username, name, email, avatarUrl } = req.body;
  const loginHandle = username || 'github-user';
  const userEmail = email || `${loginHandle}@users.noreply.github.com`;
  
  const existing = db.getUserByEmail(userEmail) || 
                   db.getUsers().find(u => u.username.toLowerCase() === loginHandle.toLowerCase());

  if (existing) {
    return res.json({ user: existing });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name || loginHandle,
    username: loginHandle,
    email: userEmail,
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(loginHandle)}`,
    bio: 'GitHub Community Member',
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  res.status(201).json({ user: newUser });
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, username, password, bio, avatarUrl } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const cleanUsername = (username || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '');
  const hashedPassword = password ? bcrypt.hashSync(password, 10) : undefined;
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    username: cleanUsername,
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    bio: bio || '',
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  res.status(201).json({ user: newUser });
});

router.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true });
});

router.get('/users', (_req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({ users });
});

// -------------------------------------------------------------
// Posts Routes
// -------------------------------------------------------------
router.get('/posts', (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const community = typeof req.query.community === 'string' ? req.query.community : undefined;
  const author = typeof req.query.author === 'string' ? req.query.author : undefined;

  const activeUser = getActiveUser(req);
  const rawPosts = db.getPosts(search, community, activeUser?.id, author);

  const posts = rawPosts.map((post) => {
    const votes = db.getVotesForPost(post.id);
    const comments = db.getCommentsForPost(post.id);
    const upvotes = votes.filter((v) => v.vote === 1).length;
    const downvotes = votes.filter((v) => v.vote === -1).length;
    const userVote = votes.find((v) => v.user_id === activeUser?.id)?.vote || 0;

    return {
      ...post,
      visibility: post.visibility || 'public',
      likes: post.likes || [],
      upvotes,
      downvotes,
      score: upvotes - downvotes,
      commentsCount: comments.length,
      userVote,
    };
  });

  res.json({ posts });
});

router.get('/posts/liked', (req: Request, res: Response) => {
  const activeUser = getActiveUser(req);
  if (!activeUser) {
    return res.json({ posts: [] });
  }

  const likedPosts = db.getLikedPosts(activeUser.id);
  const posts = likedPosts.map((post) => {
    const votes = db.getVotesForPost(post.id);
    const comments = db.getCommentsForPost(post.id);
    const upvotes = votes.filter((v) => v.vote === 1).length;
    const downvotes = votes.filter((v) => v.vote === -1).length;
    const userVote = votes.find((v) => v.user_id === activeUser.id)?.vote || 0;

    return {
      ...post,
      visibility: post.visibility || 'public',
      likes: post.likes || [],
      upvotes,
      downvotes,
      score: upvotes - downvotes,
      commentsCount: comments.length,
      userVote,
    };
  });

  res.json({ posts });
});

router.get('/posts/:id', (req: Request, res: Response) => {
  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const activeUser = getActiveUser(req);

  // Private post protection: only author or admin can view
  if (post.visibility === 'private' && post.authorId !== activeUser?.id && activeUser?.id !== 'user-1') {
    return res.status(403).json({ error: 'Forbidden: This is a private post visible only to its author.' });
  }

  const votes = db.getVotesForPost(post.id);
  const comments = db.getCommentsForPost(post.id);
  const upvotes = votes.filter((v) => v.vote === 1).length;
  const downvotes = votes.filter((v) => v.vote === -1).length;
  const userVote = votes.find((v) => v.user_id === activeUser?.id)?.vote || 0;

  res.json({
    post: {
      ...post,
      visibility: post.visibility || 'public',
      likes: post.likes || [],
      upvotes,
      downvotes,
      score: upvotes - downvotes,
      commentsCount: comments.length,
      userVote,
    },
    votes,
    comments,
  });
});

router.post('/posts', upload.single('imageFile'), (req: Request, res: Response) => {
  try {
    const currentUser = requireAuth(req, res);
    if (!currentUser) return;

    const { title, content, community, imageUrl, visibility } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let finalImageUrl = imageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const postVisibility = visibility === 'private' ? 'private' : 'public';

    const newPost = db.createPost({
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      content: content.trim(),
      image: finalImageUrl,
      authorId: currentUser.id,
      user_name: currentUser.name,
      avatar_url: currentUser.avatarUrl,
      community: community || 'General',
      visibility: postVisibility,
      likes: [],
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      post: {
        ...newPost,
        upvotes: 0,
        downvotes: 0,
        score: 0,
        commentsCount: 0,
        userVote: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create post' });
  }
});

router.put('/posts/:id', (req: Request, res: Response) => {
  const currentUser = requireAuth(req, res);
  if (!currentUser) return;

  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Security check: Only author or admin can edit
  if (post.authorId !== currentUser.id && post.user_name !== currentUser.name && currentUser.id !== 'user-1') {
    return res.status(403).json({ error: 'Forbidden: Not your post' });
  }

  const { title, content, community, visibility } = req.body;
  const updates: Partial<typeof post> = {};

  if (typeof title === 'string' && title.trim()) updates.title = title.trim();
  if (typeof content === 'string' && content.trim()) updates.content = content.trim();
  if (typeof community === 'string') updates.community = community;
  if (visibility === 'public' || visibility === 'private') updates.visibility = visibility;

  const updated = db.updatePost(req.params.id, updates);

  const votes = db.getVotesForPost(post.id);
  const comments = db.getCommentsForPost(post.id);
  const upvotes = votes.filter((v) => v.vote === 1).length;
  const downvotes = votes.filter((v) => v.vote === -1).length;
  const userVote = votes.find((v) => v.user_id === currentUser.id)?.vote || 0;

  res.json({
    post: {
      ...updated,
      upvotes,
      downvotes,
      score: upvotes - downvotes,
      commentsCount: comments.length,
      userVote,
    },
  });
});

router.put('/posts/:id/visibility', (req: Request, res: Response) => {
  const currentUser = requireAuth(req, res);
  if (!currentUser) return;

  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (post.authorId !== currentUser.id && post.user_name !== currentUser.name && currentUser.id !== 'user-1') {
    return res.status(403).json({ error: 'Forbidden: Not your post' });
  }

  const nextVisibility = req.body.visibility === 'private' ? 'private' : 'public';
  const updated = db.updatePost(req.params.id, { visibility: nextVisibility });

  res.json({
    success: true,
    visibility: nextVisibility,
    post: updated,
  });
});

router.delete('/posts/:id', (req: Request, res: Response) => {
  const currentUser = requireAuth(req, res);
  if (!currentUser) return;

  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Security check: Only author or primary admin (user-1) can delete post
  if (post.authorId !== currentUser.id && post.user_name !== currentUser.name && currentUser.id !== 'user-1') {
    return res.status(403).json({ error: 'Forbidden: Not your post' });
  }

  const deleted = db.deletePost(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ success: true, message: 'Post deleted successfully' });
});

router.post('/posts/:id/like', (req: Request, res: Response) => {
  const currentUser = requireAuth(req, res);
  if (!currentUser) return;

  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Toggle like (vote = 1)
  const result = db.setVote(post.id, currentUser.id, 1);
  const updatedVotes = db.getVotesForPost(post.id);
  const upvotes = updatedVotes.filter((v) => v.vote === 1).length;
  const downvotes = updatedVotes.filter((v) => v.vote === -1).length;

  res.json({
    action: result.action,
    userVote: result.voteType,
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    likes: post.likes || [],
  });
});

// -------------------------------------------------------------
// Votes / Reactions
// -------------------------------------------------------------
router.get('/posts/:id/votes', (req: Request, res: Response) => {
  const votes = db.getVotesForPost(req.params.id);
  const upvotes = votes.filter((v) => v.vote === 1).length;
  const downvotes = votes.filter((v) => v.vote === -1).length;

  res.json({
    postId: req.params.id,
    votes,
    upvotes,
    downvotes,
    score: upvotes - downvotes,
  });
});

router.post('/posts/:id/vote', (req: Request, res: Response) => {
  const currentUser = requireAuth(req, res);
  if (!currentUser) return;

  const { voteType } = req.body;
  if (![1, -1].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid voteType (must be 1 or -1)' });
  }

  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const result = db.setVote(post.id, currentUser.id, voteType);

  const updatedVotes = db.getVotesForPost(post.id);
  const upvotes = updatedVotes.filter((v) => v.vote === 1).length;
  const downvotes = updatedVotes.filter((v) => v.vote === -1).length;

  res.json({
    action: result.action,
    userVote: result.voteType,
    upvotes,
    downvotes,
    score: upvotes - downvotes,
  });
});

// -------------------------------------------------------------
// Comments
// -------------------------------------------------------------
router.get('/posts/:id/comments', (req: Request, res: Response) => {
  const comments = db.getCommentsForPost(req.params.id);
  res.json({ comments });
});

router.post('/posts/:id/comments', (req: Request, res: Response) => {
  const currentUser = requireAuth(req, res);
  if (!currentUser) return;

  const { content, parentId } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const comment = db.addComment({
    id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    post_id: post.id,
    user_id: currentUser.id,
    user_name: currentUser.name,
    avatar_url: currentUser.avatarUrl,
    content: content.trim(),
    parentId: parentId || undefined,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ comment });
});

// -------------------------------------------------------------
// Communities
// -------------------------------------------------------------
router.get('/communities', (_req: Request, res: Response) => {
  const communities = db.getCommunities();
  res.json({ communities });
});

router.post('/communities/:id/toggle-join', (req: Request, res: Response) => {
  const { isJoining } = req.body;
  const updated = db.toggleCommunityMembership(req.params.id, Boolean(isJoining));
  if (!updated) {
    return res.status(404).json({ error: 'Community not found' });
  }
  res.json({ community: updated });
});

router.post('/communities', (req: Request, res: Response) => {
  const { name, description, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Community name is required' });
  }

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const existing = db.getCommunityByIdOrSlug(slug);
  if (existing) {
    return res.status(409).json({ error: 'Community with this name already exists' });
  }

  const community = db.createCommunity({
    id: `comm-${Date.now()}`,
    name: name.trim(),
    slug,
    description: description ? description.trim() : '',
    icon: icon || '🌐',
    memberCount: 1,
  });

  res.status(201).json({ community });
});

// -------------------------------------------------------------
// Users
// -------------------------------------------------------------
router.put('/users/profile', (req: Request, res: Response) => {
  const currentUser = requireAuth(req, res);
  if (!currentUser) return;

  const { name, bio, avatarUrl, isPrivateAccount } = req.body;
  const updates: Partial<typeof currentUser> = {};

  if (typeof name === 'string' && name.trim()) updates.name = name.trim();
  if (typeof bio === 'string') updates.bio = bio.trim();
  if (typeof avatarUrl === 'string' && avatarUrl.trim()) updates.avatarUrl = avatarUrl.trim();
  if (typeof isPrivateAccount === 'boolean') updates.isPrivateAccount = isPrivateAccount;

  const updatedUser = db.updateUser(currentUser.id, updates);
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update existing posts author name and avatar if changed
  if (updates.name || updates.avatarUrl) {
    const userPosts = db.getPosts().filter((p) => p.authorId === currentUser.id);
    for (const post of userPosts) {
      db.updatePost(post.id, {
        ...(updates.name ? { user_name: updates.name } : {}),
        ...(updates.avatarUrl ? { avatar_url: updates.avatarUrl } : {}),
      });
    }
  }

  res.json({ user: updatedUser });
});

router.get('/users/:id', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const activeUser = getActiveUser(req);
  const userPosts = db.getPosts(undefined, undefined, activeUser?.id, user.id);
  res.json({ user, posts: userPosts });
});

export default router;
