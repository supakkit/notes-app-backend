import { Router } from 'express';
import { createNote, deleteNote, getNoteById, getUserNotes, updateNote } from '../controllers/notes.controller.js';

const router = Router();

router.post('/notes', createNote);
router.get('/notes', getUserNotes);
router.get('/notes/:noteId', getNoteById);
router.delete('/notes/:noteId', deleteNote);
router.patch('/notes/:noteId', updateNote);

export default router;