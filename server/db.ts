import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  password?: string;
  isPrivateAccount?: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image: string;
  authorId: string;
  user_name: string;
  avatar_url: string;
  community?: string;
  visibility?: 'public' | 'private';
  likes?: string[];
  created_at: string;
}

export interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  vote: number; // 1 or -1
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  avatar_url: string;
  content: string;
  parentId?: string;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  memberCount: number;
}

interface DatabaseSchema {
  users: User[];
  posts: Post[];
  votes: Vote[];
  comments: Comment[];
  communities: Community[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 'user-1',
      name: 'Mohsin Ali',
      username: 'mohsinali',
      email: 'mohsinali031332@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      bio: 'Full-Stack Developer & Creator of Social Media App',
      createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    },
    {
      id: 'user-2',
      name: 'Design Studio',
      username: 'designstudio',
      email: 'design@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'Designing interfaces and digital systems with passion.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    },
    {
      id: 'user-3',
      name: 'Alex River',
      username: 'alexriver',
      email: 'alex@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      bio: 'Nature photographer, camper, and trail lover.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    },
  ],
  communities: [
    {
      id: 'comm-1',
      name: 'Tech & Code',
      slug: 'tech-code',
      description: 'Discussions around modern web frameworks, React, Node.js, and design.',
      icon: '💻',
      memberCount: 1420,
    },
    {
      id: 'comm-2',
      name: 'Design & UI',
      slug: 'design-ui',
      description: 'Showcasing clean layouts, micro-interactions, dark themes, and UX patterns.',
      icon: '🎨',
      memberCount: 980,
    },
    {
      id: 'comm-3',
      name: 'Photography',
      slug: 'photography',
      description: 'Landscape, street, and nature photography from creators worldwide.',
      icon: '📷',
      memberCount: 650,
    },
  ],
  posts: [
    {
      id: 'post-1',
      title: 'Welcome to our new social media platform!',
      content: 'Excited to introduce our custom Node & Express powered community feed! You can now create rich posts with images, react with upvotes and downvotes, join communities, and discuss with members.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      authorId: 'user-1',
      user_name: 'Mohsin Ali',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      community: 'Tech & Code',
      visibility: 'public',
      likes: ['user-2', 'user-3'],
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'post-2',
      title: 'Exploring Modern UI Design & Clean Dark Mode',
      content: 'Clean layouts, subtle gradients, and dark mode support make for an enjoyable browsing experience. We designed this interface to look polished on both desktop and mobile screens.',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      authorId: 'user-2',
      user_name: 'Design Studio',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      community: 'Design & UI',
      visibility: 'public',
      likes: ['user-1'],
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 'post-3',
      title: 'Photography in Nature: Morning Mountain Escapes',
      content: 'Captured this tranquil shot during an early morning hike through the mountains. Nothing beats fresh air, misty ridges, and quiet scenery.',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      authorId: 'user-3',
      user_name: 'Alex River',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      community: 'Photography',
      visibility: 'public',
      likes: ['user-1'],
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  votes: [
    { id: 'vote-1', post_id: 'post-1', user_id: 'user-2', vote: 1 },
    { id: 'vote-2', post_id: 'post-1', user_id: 'user-3', vote: 1 },
    { id: 'vote-3', post_id: 'post-2', user_id: 'user-1', vote: 1 },
    { id: 'vote-4', post_id: 'post-3', user_id: 'user-1', vote: 1 },
  ],
  comments: [
    {
      id: 'comment-1',
      post_id: 'post-1',
      user_id: 'user-2',
      user_name: 'Design Studio',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      content: 'Huge congratulations on launching this backend! The responsiveness and layout feel so smooth.',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'comment-2',
      post_id: 'post-1',
      user_id: 'user-3',
      user_name: 'Alex River',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      content: 'Can’t wait to share more high-res photography here!',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'comment-3',
      post_id: 'post-1',
      user_id: 'user-1',
      user_name: 'Mohsin Ali',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      parentId: 'comment-1',
      content: '@Design Studio Thank you so much! Really appreciate the feedback and support.',
      created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
    },
  ],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
      this.save(INITIAL_DATA);
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    } catch (e) {
      console.warn('Failed to load db.json, using initial data:', e);
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  }

  private save(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save db.json:', e);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save(this.data);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save(this.data);
    return this.data.users[idx];
  }

  // Posts
  getPosts(search?: string, community?: string, requestingUserId?: string, targetAuthorId?: string): Post[] {
    let posts = [...this.data.posts];

    // Filter by target author if requested (e.g., user profile)
    if (targetAuthorId) {
      posts = posts.filter((p) => p.authorId === targetAuthorId);
      // If someone else is viewing the profile, only show public posts
      if (requestingUserId !== targetAuthorId && requestingUserId !== 'user-1') {
        posts = posts.filter((p) => (p.visibility || 'public') === 'public');
      }
    } else {
      // General feed: return public posts, plus private posts ONLY if author is requestingUserId
      posts = posts.filter((p) => {
        const vis = p.visibility || 'public';
        if (vis === 'public') return true;
        return requestingUserId && (p.authorId === requestingUserId || requestingUserId === 'user-1');
      });
    }

    if (community) {
      posts = posts.filter(
        (p) => p.community?.toLowerCase() === community.toLowerCase()
      );
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.user_name.toLowerCase().includes(q)
      );
    }
    return posts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getPostById(id: string): Post | undefined {
    return this.data.posts.find((p) => p.id === id);
  }

  createPost(post: Post): Post {
    if (!post.visibility) post.visibility = 'public';
    if (!post.likes) post.likes = [];
    this.data.posts.unshift(post);
    this.save(this.data);
    return post;
  }

  updatePost(id: string, updates: Partial<Post>): Post | undefined {
    const idx = this.data.posts.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.posts[idx] = { ...this.data.posts[idx], ...updates };
    this.save(this.data);
    return this.data.posts[idx];
  }

  deletePost(id: string): boolean {
    const initialLen = this.data.posts.length;
    this.data.posts = this.data.posts.filter((p) => p.id !== id);
    this.data.votes = this.data.votes.filter((v) => v.post_id !== id);
    this.data.comments = this.data.comments.filter((c) => c.post_id !== id);
    this.save(this.data);
    return this.data.posts.length < initialLen;
  }

  getLikedPosts(userId: string): Post[] {
    const upvotedPostIds = new Set(
      this.data.votes.filter((v) => v.user_id === userId && v.vote === 1).map((v) => v.post_id)
    );
    return this.data.posts.filter((p) => upvotedPostIds.has(p.id));
  }

  // Votes
  getVotesForPost(postId: string): Vote[] {
    return this.data.votes.filter((v) => v.post_id === postId);
  }

  getUserVote(postId: string, userId: string): Vote | undefined {
    return this.data.votes.find(
      (v) => v.post_id === postId && v.user_id === userId
    );
  }

  setVote(postId: string, userId: string, voteType: number): { action: 'created' | 'updated' | 'deleted'; voteType: number | null } {
    const existingIdx = this.data.votes.findIndex(
      (v) => v.post_id === postId && v.user_id === userId
    );

    let result: { action: 'created' | 'updated' | 'deleted'; voteType: number | null };

    if (existingIdx !== -1) {
      if (this.data.votes[existingIdx].vote === voteType) {
        // Toggle off
        this.data.votes.splice(existingIdx, 1);
        result = { action: 'deleted', voteType: null };
      } else {
        this.data.votes[existingIdx].vote = voteType;
        result = { action: 'updated', voteType };
      }
    } else {
      this.data.votes.push({
        id: `vote-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        post_id: postId,
        user_id: userId,
        vote: voteType,
      });
      result = { action: 'created', voteType };
    }

    // Sync post.likes array
    const targetPost = this.data.posts.find((p) => p.id === postId);
    if (targetPost) {
      if (!Array.isArray(targetPost.likes)) {
        targetPost.likes = [];
      }
      if (result.voteType === 1) {
        if (!targetPost.likes.includes(userId)) {
          targetPost.likes.push(userId);
        }
      } else {
        targetPost.likes = targetPost.likes.filter((id) => id !== userId);
      }
    }

    this.save(this.data);
    return result;
  }

  // Comments
  getCommentsForPost(postId: string): Comment[] {
    return this.data.comments
      .filter((c) => c.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addComment(comment: Comment): Comment {
    this.data.comments.push(comment);
    this.save(this.data);
    return comment;
  }

  // Communities
  getCommunities(): Community[] {
    return this.data.communities;
  }

  getCommunityByIdOrSlug(val: string): Community | undefined {
    return this.data.communities.find(
      (c) => c.id === val || c.slug === val || c.name.toLowerCase() === val.toLowerCase()
    );
  }

  createCommunity(comm: Community): Community {
    this.data.communities.push(comm);
    this.save(this.data);
    return comm;
  }

  toggleCommunityMembership(idOrSlug: string, isJoining: boolean): Community | undefined {
    const comm = this.getCommunityByIdOrSlug(idOrSlug);
    if (!comm) return undefined;
    comm.memberCount = Math.max(1, (comm.memberCount || 1) + (isJoining ? 1 : -1));
    this.save(this.data);
    return comm;
  }
}

export const db = new Database();
