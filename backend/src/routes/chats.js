import { Router } from 'express';
import { getDb } from '../db/client.js';

export const chatsRouter = Router();

function requireAuth(req, res) {
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Sign in to access chat history.' });
    return null;
  }
  return userId;
}

chatsRouter.get('/', async (req, res, next) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const { data, error } = await getDb()
      .from('chats')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json({ chats: data ?? [] });
  } catch (err) {
    next(err);
  }
});

chatsRouter.post('/', async (req, res, next) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const title = typeof req.body?.title === 'string' ? req.body.title.slice(0, 60) : null;
  try {
    const { data, error } = await getDb()
      .from('chats')
      .insert({ user_id: userId, title })
      .select('id, title, created_at, updated_at')
      .single();
    if (error) throw error;
    res.status(201).json({ chat: data });
  } catch (err) {
    next(err);
  }
});

chatsRouter.get('/:id/messages', async (req, res, next) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const db = getDb();
    const { data: chat, error: chatErr } = await db
      .from('chats')
      .select('id, user_id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (chatErr) throw chatErr;
    if (!chat || chat.user_id !== userId) return res.status(404).json({ error: 'Chat not found' });

    const { data, error } = await db
      .from('messages')
      .select('id, role, content, sources, created_at')
      .eq('chat_id', req.params.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ messages: data ?? [] });
  } catch (err) {
    next(err);
  }
});

chatsRouter.delete('/:id', async (req, res, next) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const { error } = await getDb()
      .from('chats')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
