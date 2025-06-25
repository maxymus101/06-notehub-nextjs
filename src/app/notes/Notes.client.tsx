"use client";

import { useState, useEffect } from "react";
import {
  useQuery,
  useQueryClient,
  QueryClientProvider,
  QueryClient,
  keepPreviousData,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { useDebounce } from "use-debounce";

// import Loader from "../../components/Loader/Loader.tsx";
// import ErrorMessage from "../../components/ErrorMessage/ErrorMessage.tsx";
import Pagination from "../components/Pagination/Pagination";
import css from "../notes/notes.module.css"; // Шлях до стилів App.module.css

import { fetchNotes, PaginatedNotesResponse } from "../lib/api";
import { Note } from "../types/note";
import NotesList from "../components/NoteList/NoteList";
import SearchBox from "../components/SearchBox/SearchBox";
import NoteModal from "../components/NoteModal/NoteModal";
import NoteForm from "../components/NoteForm/NoteForm";

// Інтерфейс для пропсів, які приймає клієнтський компонент від серверного
interface NotesClientProps {
  dehydratedState: unknown; // Серіалізований стан від TanStack Query
}

function InnerNotesContent({ dehydratedState }: { dehydratedState: unknown }) {
  // Створюємо екземпляр QueryClient на клієнтській стороні
  // Використовуємо `useState` для гарантії, що QueryClient створюється лише один раз.
  const [queryClient] = useState(() => new QueryClient());

  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(currentSearchQuery, 500);

  const [currentPage, setCurrentPage] = useState(1);
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
    queryKey: ["notes", currentPage, 10, debouncedSearchQuery],
    queryFn: () => fetchNotes(currentPage, 10, debouncedSearchQuery),
    enabled: true,
    placeholderData: keepPreviousData,
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
  }, [
    isSuccess,
    data,
    debouncedSearchQuery,
    isError,
    queryError,
    errorMessage,
  ]);

  // Обробник пошуку:
  const handleSearchTermChange = (newQuery: string) => {
    setCurrentSearchQuery(newQuery);
    setCurrentPage(1);
    setErrorMessage(null);
  };

  // Обробник зміни сторінки для Pagination компонента
  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className={css.notes}>
      <header className={css.toolbar}>
        <SearchBox onSearch={handleSearchTermChange} />

        <Pagination
          pageCount={totalPagesToDisplay}
          currentPage={currentPage}
          onPageChange={handlePageClick}
        />

        <button className={css.button} onClick={openCreateNoteModal}>
          Create note +
        </button>
      </header>

      {/* {(isLoading || isFetching) && <Loader />} */}

      {/* {errorMessage && <ErrorMessage message={errorMessage} onClose={handleCloseErrorMessage} />} */}

      {notesToDisplay.length > 0 && <NotesList notes={notesToDisplay} />}
      {!isLoading &&
        !isFetching &&
        !isError &&
        notesToDisplay.length === 0 &&
        !debouncedSearchQuery && (
          <p className={css.initialMessage}>
            Start by searching for notes or create a new one!
          </p>
        )}
      {!isLoading &&
        !isFetching &&
        !isError &&
        notesToDisplay.length === 0 &&
        debouncedSearchQuery && (
          <p className={css.noResultsMessage}>
            No notes found for "{debouncedSearchQuery}".
          </p>
        )}

      <Toaster />

      {isNoteModalOpen && <NoteModal onClose={closeCreateNoteModal} />}
    </div>
  );
}

export default function NotesClient({ dehydratedState }: NotesClientProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <InnerNotesContent dehydratedState={dehydratedState} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
