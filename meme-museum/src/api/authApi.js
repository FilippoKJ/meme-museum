/**
 * api/authApi.js
 * Login, registrazione, profilo utente.
 */

import client from './client';
import { mockApi } from './mock';

const USE_MOCK = false; // ← stesso flag di memesApi

/**
 * Login con username e password.
 * @returns {{ token: string, user: User }}
 */
export const login = (username, password) =>
  USE_MOCK
    ? mockApi.login(username, password)
    : client('/auth/login', { body: { username, password }, auth: false });

/**
 * Registrazione nuovo utente.
 * @returns {{ token: string, user: User }}
 */
export const register = (username, password) =>
  USE_MOCK
    ? mockApi.register(username, password)
    : client('/auth/register', { body: { username, password }, auth: false });

/**
 * Dati utente corrente (verifica token).
 * @returns {User}
 */
export const getMe = () =>
  USE_MOCK ? mockApi.getMe() : client('/auth/me');
