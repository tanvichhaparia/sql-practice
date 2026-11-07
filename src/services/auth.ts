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

// Pre-seeded reviewer/demo accounts for payment gateway verification
export const DEFAULT_PRESEEDED_USERS: AuthUser[] = [
  {
    id: 'user_reviewer_sqledge',
    name: 'Razorpay Reviewer',
    email: 'test@sqledge.app',
    passwordHash: '8d03d6a6aee42bdd2a50ce226431d37ada580820849b6fe8102bca98415e2386', // Test@1234
    college: 'Compliance Review Team',
    targetRole: 'Platform Verifier',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_reviewer_razorpay',
    name: 'Verification Officer',
    email: 'reviewer@razorpay.com',
    passwordHash: '8d03d6a6aee42bdd2a50ce226431d37ada580820849b6fe8102bca98415e2386', // Test@1234
    college: 'Razorpay Verification',
    targetRole: 'Payment Gateway Auditor',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];


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
    const users: AuthUser[] = raw ? JSON.parse(raw) : [];
    for (const pre of DEFAULT_PRESEEDED_USERS) {
      if (!users.some((u) => u.email.toLowerCase() === pre.email.toLowerCase())) {
        users.push(pre);
      }
    }
    return users;
  } catch {
    return [...DEFAULT_PRESEEDED_USERS];
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

export function findUserByEmail(email: string): AuthUser | undefined {
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: 'Please enter your registered email address.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  const users = loadUsers();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (userIndex === -1) {
    return { success: false, message: 'No registered account found with this email address.' };
  }

  const newHash = await hashPassword(newPassword);
  users[userIndex].passwordHash = newHash;
  saveUsers(users);

  // If this user was currently logged in, update active session
  const current = getCurrentUser();
  if (current && current.email.toLowerCase() === cleanEmail) {
    current.passwordHash = newHash;
    setCurrentUser(current);
  }

  return { success: true, message: 'Password successfully reset! You can now log in with your new password.' };
}
