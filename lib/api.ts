import axios from "axios";
import type { NoteTag, Note } from "../../types/note";

export interface NewNoteContent {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface PaginatedNotesResponse {
  notes: Note[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface DeletedNoteInfo {
  message: string;
  deletedNoteId: number;
}

const BASE_URL = "https://notehub-public.goit.study/api";

const TOKEN = process.env.NEXT_PUBLIC_NOTEHUB_T;

const axiosConfig = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
});

export const fetchNotes = async (
  page: number = 1,
  perPage: number = 12,
  search: string = ""
): Promise<PaginatedNotesResponse> => {
  try {
    const response = await axiosConfig.get<PaginatedNotesResponse>("/notes", {
      params: {
        page,
        ...(search !== "" && { search: search }),
        perPage,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching notes:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    } else {
      console.error("Unexpected error fetching notes:", error);
    }
    throw error;
  }
};

export const fetchNoteById = async (id: number) => {
  const res = await axiosConfig.get<Note>(`/notes/${id}`);
  console.log(res.data);
  return res.data;
};

export const createNote = async (content: NewNoteContent): Promise<Note> => {
  try {
    const response = await axiosConfig.post<Note>("/notes", content);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error creating note:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    } else {
      console.error("Unexpected error creating note:", error);
    }
    throw error;
  }
};

export const deleteNote = async (id: number): Promise<DeletedNoteInfo> => {
  try {
    const response = await axiosConfig.delete<DeletedNoteInfo>(`/notes/${id}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error deleting note with ID ${id}:`, error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    } else {
      console.error("Unexpected error deleting note:", error);
    }
    throw error;
  }
};
