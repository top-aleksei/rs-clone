import { User } from '../types/entrance';

const HOST = 'http://127.0.0.1:13500/api/users';
// const HOST = 'http://45.82.153.155:13500/api/users';

export async function createUser(user: User) {
  try {
    const res = await fetch(`${HOST}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return await res.json();
  } catch {
    throw new Error('Something went wrong');
  }
}

export async function authorization(user: User) {
  try {
    const res = await fetch(`${HOST}/autorization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return await res.json();
  } catch (err) {
    throw new Error('Something went wrong');
  }
}
