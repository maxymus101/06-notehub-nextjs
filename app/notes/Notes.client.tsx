"use client";

import { useState, useEffect } from "react";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { useDebounce } from "use-debounce";

import Pagination from "../../components/Pagination/Pagination";
import css from "./NotesPage.module.css"; // Шлях до стилів App.module.css

import { fetchNotes, PaginatedNotesResponse } from "../../lib/api";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { Note } from "../../types/note";
import NoteList from "../../components/NoteList/NoteList";
import SearchBox from "../../components/SearchBox/SearchBox";
import NoteModal from "../../components/NoteModal/NoteModal";


interface NotesClientProps {
  initialNotes: PaginatedNotesResponse; 
}

export default function NotesClient({ initialNotes }: NotesClientProps) {
  const queryClient = useQueryClient(); // useQueryClient тепер викликається в правильному контексті

  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(currentSearchQuery, 500);

  const [currentPage, setCurrentPage] = useState(initialNotes.page || 1); // Використовуємо початкову сторінку з SSR даних
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false); 

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // === useQuery для отримання нотаток ===
  const {
    data, 
    error: queryError,
    isLoading,
    isError,
    isSuccess,
    isFetching,
  } = useQuery<PaginatedNotesResponse, Error>({
    queryKey: ["notes", currentPage, debouncedSearchQuery], 
    queryFn: () => fetchNotes(currentPage, 12, debouncedSearchQuery), 
    enabled: true, 
    placeholderData: keepPreviousData,
    initialData: initialNotes, 
    staleTime: 60 * 1000, 
  });

  const notifyNoNotesFound = () =>
    toast.error("No notes found for your request.", {
      style: { background: "rgba(125, 183, 255, 0.8)" },
      icon: "ℹ️",
    });

  useEffect(() => {
    if (isError && queryError) {
      setErrorMessage(queryError.message);
    } else if (errorMessage && !isError) {
      setErrorMessage(null);
    }

    if (isSuccess && debouncedSearchQuery && (data?.notes || []).length === 0) {
      notifyNoNotesFound();
    }
  }, [isSuccess, data, debouncedSearchQuery, isError, queryError, errorMessage]);


  // Обробник пошуку:
  const handleSearchTermChange = (newQuery: string) => {
    setCurrentSearchQuery(newQuery);
    setCurrentPage(1); 
    setErrorMessage(null); 
  };

  // Обробник зміни сторінки для Pagination компонента
  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null); 
  };

  // Функції для відкриття та закриття модального вікна створення нотатки.
  const openCreateNoteModal = () => setIsNoteModalOpen(true);
  const closeCreateNoteModal = () => setIsNoteModalOpen(false);

  // Функція для закриття повідомлення про помилку
  const handleCloseErrorMessage = () => {
    setErrorMessage(null); 
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  // Локальні змінні для рендерингу.
  const notesToDisplay: Note[] = data?.notes || [];
  const totalPagesToDisplay: number = data?.totalPages ?? 0;

  console.log("Notes to display in Notes.client.tsx render:", notesToDisplay);
  console.log("Total pages to display in Notes.client.tsx:", totalPagesToDisplay);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onSearch={handleSearchTermChange} /> 
        
        { notesToDisplay.length > 0 && (<Pagination
          totalPages={totalPagesToDisplay}
          currentPage={currentPage}
          onPageChange={handlePageClick}
        />)}

        <button className={css.button} onClick={openCreateNoteModal}>
          Create note +
        </button>
      </header>

      
      {errorMessage && <ErrorMessage message={errorMessage} onClose={handleCloseErrorMessage} />}

      {notesToDisplay.length > 0 && (
        <NoteList notes={notesToDisplay} /> 
      )}
      {!isLoading && !isFetching && !isError && notesToDisplay.length === 0 && !debouncedSearchQuery && (
        <p className={css.initialMessage}>Start by searching for notes or create a new one!</p>
      )}
      {!isLoading && !isFetching && !isError && notesToDisplay.length === 0 && debouncedSearchQuery && (
        <p className={css.noResultsMessage}>No notes found for &quot;{debouncedSearchQuery}&quot;.</p>
      )}

      <Toaster /> 

      {isNoteModalOpen && (
        <NoteModal 
          onClose={closeCreateNoteModal} 
        />
      )}
    </div>
  );
}
