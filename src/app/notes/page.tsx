import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Імпортуємо для SSR
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchNotes } from "../lib/api";
import NotesClient from "./Notes.client";

// Константа для кількості нотаток на сторінці
const PER_PAGE_LIMIT = 12;

export default async function NotesPage() {
  const queryClient = new QueryClient(); // Створюємо новий екземпляр QueryClient для кожного запиту

  // Отримуємо початкові дані нотаток на стороні сервера
  try {
    await queryClient.fetchQuery({
      queryKey: ["notes", 1, PER_PAGE_LIMIT, ""], // Початковий запит: перша сторінка, 12 елементів, без пошуку
      queryFn: () => fetchNotes(1, PER_PAGE_LIMIT, ""),
      staleTime: 60 * 1000, // Дані вважаються "свіжими" протягом 1 хвилини
    });
  } catch (error) {
    console.error("Error fetching initial notes data on server:", error);
    // Якщо виникла помилка, ви можете обробити її тут, наприклад, перенаправити або показати заглушку.
    // QueryClient не буде мати дані, і useQuery на клієнті спробує отримати їх знову.
  }

  // Серіалізуємо стан QueryClient, щоб його можна було передати на клієнт
  // `dehydrate` повертає "чистий" об'єкт, який можна передати через серверно-клієнтську межу.
  const dehydratedState = dehydrate(queryClient);

  return <NotesClient dehydratedState={dehydratedState} />;
}
