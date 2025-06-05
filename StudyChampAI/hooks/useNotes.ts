import { useState, useEffect } from 'react';
import { pdfService, StudyNote } from '../utils/pdfService';

export const useNotes = () => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const savedNotes = await pdfService.getSavedNotes();
      setNotes(savedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNotes = async (topic: string) => {
    setIsGenerating(true);
    try {
      await pdfService.generateAndDownloadNotes(topic);
      // Reload notes to show the new one
      await loadNotes();
    } catch (error) {
      console.error('Error generating notes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openNote = async (note: StudyNote) => {
    if (note.pdfUrl) {
      await pdfService.openPDF(note.pdfUrl);
    } else {
      // Generate PDF if not exists
      try {
        setIsGenerating(true);
        const pdfPath = await pdfService.generatePDF(note);
        await pdfService.openPDF(pdfPath);
        await loadNotes();
      } catch (error) {
        console.error('Error opening note:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const shareNote = async (note: StudyNote) => {
    if (note.pdfUrl) {
      await pdfService.sharePDF(note.pdfUrl, note.topic);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await pdfService.deleteNote(noteId);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return {
    notes,
    isLoading,
    isGenerating,
    loadNotes,
    generateNotes,
    openNote,
    shareNote,
    deleteNote,
  };
};
