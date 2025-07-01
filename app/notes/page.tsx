
import { fetchNotes } from "../../lib/api";
import NotesClient from "./Notes.client";
import { type PaginatedNotesResponse } from "../../lib/api";
import css from "./NotesPage.module.css"

// Константа для кількості нотаток на сторінці
const PER_PAGE_LIMIT = 12;

export default async function NotesPage() {
  const initialNotesData: PaginatedNotesResponse = await fetchNotes(1, PER_PAGE_LIMIT, "");

  return (
  <div className={css.app}>
      <h1>Notes</h1>
      <br />
      <NotesClient initialNotes={initialNotesData} />
    </div>
  );
}