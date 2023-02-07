import { User } from '../types/entrance';

const HOST = 'http://127.0.0.1:13500/api/users';

export async function createUser(user: User) {
  try {
    const res = await fetch(`${HOST}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return res;
  } catch {
    throw new Error('Something went wrong');
  }
}

export async function Authorization(user: User) {
  try {
    const res = await fetch(`${HOST}/autorization`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
  } catch {
    throw new Error('Something went wrong');
  }
}
