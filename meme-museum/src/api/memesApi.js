/**
 * api/memesApi.js
 * Per passare al backend reale: USE_MOCK = false
 */

import client from './client';
import { mockApi } from './mock';

const USE_MOCK = false;

/** Lista meme con tutti i filtri */
export const getMemes = (params = {}) =>
  USE_MOCK
    ? mockApi.getMemes(params)
    : client(`/memes?${new URLSearchParams(params)}`);

/** Meme del giorno */
export const getMemeOfDay = () =>
  USE_MOCK
    ? mockApi.getMemeOfDay()
    : client('/memes/today');

/** Singolo meme per ID */
export const getMeme = (id) =>
  USE_MOCK ? mockApi.getMeme(id) : client(`/memes/${id}`);

/** Vota */
export const vote = (memeId, type) =>
  USE_MOCK
    ? mockApi.vote(memeId, type)
    : client(`/memes/${memeId}/vote`, { body: { type } });

/** Rimuovi voto */
export const removeVote = (memeId) =>
  USE_MOCK
    ? mockApi.removeVote(memeId)
    : client(`/memes/${memeId}/vote`, { method: 'DELETE' });

/** Commenti */
export const getComments = (memeId) =>
  USE_MOCK
    ? mockApi.getComments(memeId)
    : client(`/memes/${memeId}/comments`);

/** Posta commento */
export const postComment = (memeId, text) =>
  USE_MOCK
    ? mockApi.postComment(memeId, text)
    : client(`/memes/${memeId}/comments`, { body: { text } });
