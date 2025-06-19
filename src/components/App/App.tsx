import css from "./App.module.css";
import NoteList from "../NoteList/NoteList.tsx";
import NoteModal from "../NoteModal/NoteModal.tsx";
import SearchBox from "../SearchBox/SearchBox.tsx";
import Pagination from "../Pagination/Pagination.tsx";

import Loader from "../Loader/Loader.tsx";
import ErrorMessage from "../ErrorMessage/ErrorMessage.tsx";
import { type PaginatedNotesResponse } from "../../services/noteService.ts";
import { fetchNotes } from "../../services/noteService.ts";
import { type Note } from "../../types/note.ts";

import { useDebounce } from "use-debounce";
import { useState, useEffect } from "react";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const queryClient = useQueryClient(); // Ініціалізуємо queryClient для інвалідації кешу
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(currentSearchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false); // Стан для керування модалкою створення нотатки
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // === useQuery для отримання нотаток ===
  const { data, isLoading, isError, isFetching } = useQuery<
    PaginatedNotesResponse,
    Error
  >({
    queryKey: ["notes", currentPage, debouncedSearchQuery],
    queryFn: () => fetchNotes(currentPage, 12, debouncedSearchQuery),
    enabled: true,
    placeholderData: keepPreviousData,
  });

  const notifyNoNotesFound = () =>
    toast.error("No notes found for your request.", {
      style: { background: "rgba(125, 183, 255, 0.8)" },
      icon: "ℹ️",
    });

  // useEffect для відображення сповіщення про відсутність нотаток
  useEffect(() => {
    if (data?.notes.length === 0) {
      notifyNoNotesFound();
    }
  }, [data]);

  // Обробник пошуку:
  const handleSearch = (newQuery: string) => {
    setCurrentSearchQuery(newQuery);
    setCurrentPage(1);
    setErrorMessage(null);
  };

  // Обробник зміни сторінки для ReactPaginate:
  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrorMessage(null);
  };

  // Обробник для кнопки "Create note +"
  const openCreateNoteModal = () => setIsNoteModalOpen(true);
  const closeCreateNoteModal = () => setIsNoteModalOpen(false);

  const handleCloseErrorMessage = () => {
    setErrorMessage(null);
    queryClient.resetQueries({ queryKey: ["notes"], exact: false }); // Можливо, інвалідувати або скинути конкретні запити, якщо помилка пов'язана з ними
    queryClient.invalidateQueries({ queryKey: ["notes"] }); // Інвалідуємо запити після закриття помилки
  };

  // Локальні змінні для рендерингу, обчислюються на кожному рендері.
  const notesToDisplay: Note[] = data?.notes || [];
  const totalPagesToDisplay: number = data?.totalPages ?? 0;

  return (
    <>
      <div className={css.app}>
        <header className={css.toolbar}>
          <SearchBox onSearch={handleSearch} />
          {notesToDisplay.length > 0 && (
            <Pagination
              pageCount={totalPagesToDisplay}
              currentPage={currentPage}
              onPageChange={handlePageClick}
            />
          )}

          <button
            className={css.createNoteButton}
            onClick={openCreateNoteModal}
          >
            Create note +
          </button>
        </header>

        {/* Лоадер відображається, коли йде завантаження (первинне або фонове оновлення) або коли виконуються мутації видалення.*/}
        {(isLoading || isFetching) && <Loader />}
        {/* ErrorMessage відображається, якщо `errorMessage` не null. */}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            onClose={handleCloseErrorMessage}
          />
        )}
        {notesToDisplay.length > 0 && <NoteList notes={notesToDisplay} />}

        {/* Повідомлення про початковий стан або відсутність результатів */}
        {!isLoading &&
          !isFetching &&
          !isError &&
          notesToDisplay.length === 0 &&
          !currentSearchQuery && (
            <p className={css.initialMessage}>
              Start by searching for notes or create a new one!
            </p>
          )}
        {!isLoading &&
          !isFetching &&
          !isError &&
          notesToDisplay.length === 0 &&
          currentSearchQuery && (
            <p className={css.noResultsMessage}>
              No notes found for "{currentSearchQuery}".
            </p>
          )}
        <Toaster />
        {isNoteModalOpen && <NoteModal onClose={closeCreateNoteModal} />}
      </div>
    </>
  );
}
