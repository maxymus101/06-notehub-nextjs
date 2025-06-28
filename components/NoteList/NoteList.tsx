import css from "./NoteList.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Імпортуємо useMutation та useQueryClient
import toast from "react-hot-toast"; // Імпортуємо toast для повідомлень
import Link from "next/link";
import { type Note } from "../../types/note";
import { deleteNote, type DeletedNoteInfo } from "../../lib/api";

interface NoteListProps {
  notes: Note[];
}

export default function NotesList({ notes }: NoteListProps) {
  const queryClient = useQueryClient(); // Ініціалізуємо queryClient

  // === useMutation для видалення нотатки ===
  const deleteNoteMutation = useMutation<DeletedNoteInfo, Error, number>({
    // Типи: успішна відповідь, помилка, ID нотатки
    mutationFn: deleteNote, // Функція з noteService, яка виконує DELETE-запит
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] }); // Інвалідуємо кеш після успішного видалення
      toast.success("Note deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Error deleting note: ${error.message}`);
    },
  });

  // Обробник видалення нотатки, який викликає мутацію
  const handleDeleteNote = (id: number) => {
    deleteNoteMutation.mutate(id); // Запускаємо мутацію видалення
  };

  if (notes.length === 0) {
    return <p className={css.noNotesMessage}>No notes found.</p>;
  }
  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li key={note.id} className={css.listItem}>
          <h2 className={css.title}>{note.title}</h2>

          <p className={css.content}>{note.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>
            <Link className={css.detail_button} href={`/notes/${note.id}`}>
              {" "}
              View details
            </Link>
            <button
              className={css.del_button}
              onClick={() => handleDeleteNote(note.id)} // Викликаємо внутрішній обробник
              disabled={deleteNoteMutation.isPending} // Вимикаємо кнопку під час видалення
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
