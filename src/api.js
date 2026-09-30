// Frontend API client for Node.js / Express backend

const BASE_URL = '/api';

function getAuthHeaders() {
  const headers = {};
  try {
    const savedUser = localStorage.getItem('active_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed?.id) {
        headers['x-user-id'] = parsed.id;
      }
    }
  } catch {
    // ignore
  }
  return headers;
}

// -------------------------------------------------------------
// Posts
// -------------------------------------------------------------
export async function getPosts({ search, community, author } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (community) params.append('community', community);
  if (author) params.append('author', author);

  const url = `${BASE_URL}/posts${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch posts');
  }
  const data = await res.json();
  return data.posts || [];
}

export async function getLikedPosts() {
  const res = await fetch(`${BASE_URL}/posts/liked`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch liked posts');
  }
  const data = await res.json();
  return data.posts || [];
}

export async function getPostById(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch post');
  }
  return await res.json();
}

export async function createPost({ title, content, community, imageFile, imageUrl, visibility }) {
  const authHeaders = getAuthHeaders();

  if (imageFile instanceof File || imageFile instanceof Blob) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (community) formData.append('community', community);
    if (visibility) formData.append('visibility', visibility);
    formData.append('imageFile', imageFile);

    const res = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create post');
    }
    return await res.json();
  }

  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({
      title,
      content,
      community,
      imageUrl: imageUrl || '',
      visibility: visibility || 'public',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create post');
  }
  return await res.json();
}

export async function updatePost(id, { title, content, community, visibility }) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      title,
      content,
      community,
      visibility,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update post');
  }
  return await res.json();
}

export async function togglePostVisibility(id, visibility) {
  const res = await fetch(`${BASE_URL}/posts/${id}/visibility`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ visibility }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update privacy');
  }
  return await res.json();
}

export async function togglePostLike(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to toggle like');
  }
  return await res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete post');
  }
  return await res.json();
}

// -------------------------------------------------------------
// Votes
// -------------------------------------------------------------
export async function getVotes(postId) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/votes`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch votes');
  }
  return await res.json();
}

export async function submitVote(postId, voteType) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ voteType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to record vote');
  }
  return await res.json();
}

// -------------------------------------------------------------
// Comments
// -------------------------------------------------------------
export async function getComments(postId) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch comments');
  }
  const data = await res.json();
  return data.comments || [];
}

export async function addComment(postId, content, parentId) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ content, parentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to post comment');
  }
  return await res.json();
}

// -------------------------------------------------------------
// Communities
// -------------------------------------------------------------
export async function getCommunities() {
  const res = await fetch(`${BASE_URL}/communities`);
  if (!res.ok) {
    throw new Error('Failed to fetch communities');
  }
  const data = await res.json();
  return data.communities || [];
}

export async function createCommunity(communityData) {
  const res = await fetch(`${BASE_URL}/communities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(communityData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create community');
  }
  return await res.json();
}

export async function toggleCommunityJoin(communityId, isJoining) {
  const res = await fetch(`${BASE_URL}/communities/${communityId}/toggle-join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ isJoining }),
  });
  if (!res.ok) {
    throw new Error('Failed to update community membership');
  }
  return await res.json();
}

// -------------------------------------------------------------
// Auth & Users
// -------------------------------------------------------------
export async function getCurrentUser() {
  const headers = getAuthHeaders();
  if (!headers['x-user-id']) {
    return null;
  }
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}

export async function loginUser({ email, username, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to log in');
  }
  const data = await res.json();
  if (data.user) {
    localStorage.setItem('active_user', JSON.stringify(data.user));
  }
  return data.user;
}

export async function registerUser({ name, email, username, password, bio, avatarUrl }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, username, password, bio, avatarUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to register');
  }
  const data = await res.json();
  if (data.user) {
    localStorage.setItem('active_user', JSON.stringify(data.user));
  }
  return data.user;
}

export async function loginWithGitHub({ username, name, email, avatarUrl }) {
  const res = await fetch(`${BASE_URL}/auth/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, name, email, avatarUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to log in with GitHub');
  }
  const data = await res.json();
  if (data.user) {
    localStorage.setItem('active_user', JSON.stringify(data.user));
  }
  return data.user;
}

export async function getUsersList() {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.users || [];
}

export async function getUserProfile(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  if (!res.ok) {
    throw new Error('User not found');
  }
  return await res.json();
}

export async function updateUserProfile({ name, bio, avatarUrl, isPrivateAccount }) {
  const res = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name, bio, avatarUrl, isPrivateAccount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update profile');
  }
  const data = await res.json();
  if (data.user) {
    localStorage.setItem('active_user', JSON.stringify(data.user));
  }
  return data.user;
}

/**
 * Robust, exception-safe clipboard copy with legacy fallback
 */
export async function copyToClipboardSafe(text) {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to document.execCommand
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
