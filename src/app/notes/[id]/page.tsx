import { fetchNoteById } from "../../lib/api";
import css from "./NoteDetail.module.css";

interface NoteDetailPageProps {
  params: Promise<{ id: number }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const note = await fetchNoteById(id);
  console.log(note);

  return (
    <div className={css.container}>
      <h1 className={css.title}>{note.title}</h1>
      <p className={css.content}>{note.content}</p>
      <div className={css.meta}>
        <span className={css.tag}>{note.tag}</span>
        <span className={css.timestamps}>
          Created: {new Date(note.createdAt).toLocaleString()} | Updated:{" "}
          {new Date(note.updatedAt).toLocaleString()}
        </span>
      </div>
      {/* Тут можна додати кнопки для редагування або повернення назад */}
    </div>
  );
}
