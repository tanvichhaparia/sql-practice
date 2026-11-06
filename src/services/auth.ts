export interface AuthUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // SHA-256 hash
  college?: string;
  targetRole?: string;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'sqledge_users_v1';
const CURRENT_USER_KEY = 'sqledge_current_user_v1';

// SHA-256 password hashing with salt using browser Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const salt = 'sqledge_salt_sec_2026';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function loadUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsers(users: AuthUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export async function signupUser(
  name: string,
  email: string,
  password: string,
  college?: string,
  targetRole?: string
): Promise<{ success: boolean; message?: string; user?: AuthUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) {
    return { success: false, message: 'Please enter your full name.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const users = loadUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  // Hash password before saving
  const passwordHash = await hashPassword(password);

  const newUser: AuthUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: cleanName,
    email: cleanEmail,
    passwordHash: passwordHash, // Saved only as SHA-256 hash
    college: college?.trim() || 'Engineering College',
    targetRole: targetRole?.trim() || 'Software Engineer / Data Analyst',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: AuthUser }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, message: 'Please provide both email and password.' };
  }

  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, message: 'No registered account found with this email. Please sign up.' };
  }

  const inputHash = await hashPassword(password);
  if (user.passwordHash !== inputHash) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setCurrentUser(null);
}
