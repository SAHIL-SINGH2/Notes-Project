import mongoose from "mongoose";
import Note from "../models/Note.js";
import { isDbConnected } from "../config/db.js";

const fallbackNotes = [];

const createFallbackNote = ({ title, content }) => {
  const note = {
    _id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fallbackNotes.unshift(note);
  return note;
};

const updateFallbackNote = (id, { title, content }) => {
  const noteIndex = fallbackNotes.findIndex((note) => note._id === id);
  if (noteIndex === -1) return null;
  fallbackNotes[noteIndex] = {
    ...fallbackNotes[noteIndex],
    title,
    content,
    updatedAt: new Date().toISOString(),
  };
  return fallbackNotes[noteIndex];
};

export async function getAllNotes(_, res) {
  try {
    if (!isDbConnected()) {
      return res.status(200).json(fallbackNotes);
    }

    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getNoteById(req, res) {
  try {
    if (!isDbConnected()) {
      const note = fallbackNotes.find((item) => item._id === req.params.id);
      if (!note) return res.status(404).json({ message: "Note not found!" });
      return res.json(note);
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found!" });
    res.json(note);
  } catch (error) {
    console.error("Error in getNoteById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createNote(req, res) {
  try {
    const { title, content } = req.body;

    if (!isDbConnected()) {
      const savedNote = createFallbackNote({ title, content });
      return res.status(201).json(savedNote);
    }

    const note = new Note({ title, content });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateNote(req, res) {
  try {
    const { title, content } = req.body;

    if (!isDbConnected()) {
      const updatedNote = updateFallbackNote(req.params.id, { title, content });
      if (!updatedNote) return res.status(404).json({ message: "Note not found" });
      return res.status(200).json(updatedNote);
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      {
        new: true,
      }
    );

    if (!updatedNote) return res.status(404).json({ message: "Note not found" });

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteNote(req, res) {
  try {
    if (!isDbConnected()) {
      const noteIndex = fallbackNotes.findIndex((note) => note._id === req.params.id);
      if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });
      fallbackNotes.splice(noteIndex, 1);
      return res.status(200).json({ message: "Note deleted successfully!" });
    }

    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
