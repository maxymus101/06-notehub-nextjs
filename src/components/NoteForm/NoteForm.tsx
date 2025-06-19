import css from "./NoteForm.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Formik,
  Field,
  Form,
  ErrorMessage as FormikErrorMessage,
} from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { type NoteTag, type Note } from "../../types/note.ts";
import { type NewNoteContent, createNote } from "../../services/noteService.ts";

interface NoteFormProps {
  onCancel: () => void; // Обробник для кнопки Cancel
  onModalClose: () => void; // Пропс для закриття модального вікна після успішного сабміту
}

// Схема валідації за допомогою Yup
const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters")
    .required("Title is required"),
  content: Yup.string().max(500, "Content must be at most 500 characters"),
  tag: Yup.string<NoteTag>() // Вказуємо, що це тип NoteTag
    .oneOf(
      ["Todo", "Work", "Personal", "Meeting", "Shopping"],
      "Invalid tag selected"
    )
    .required("Tag is required"),
});

const initialValues: NewNoteContent = {
  title: "",
  content: "",
  tag: "Personal", // Початкові значення за замовчуванням
};

export default function NoteForm({ onCancel, onModalClose }: NoteFormProps) {
  const queryClient = useQueryClient(); // Ініціалізуємо queryClient

  // === useMutation для створення нової нотатки ===
  const createNoteMutation = useMutation<Note, Error, NewNoteContent>({
    mutationFn: createNote, // Функція з noteService, яка виконує POST-запит
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] }); // Інвалідуємо кеш запитів "notes"
      toast.success("Note created successfully!"); // Повідомлення про успіх
      onModalClose(); // Закриваємо модалку після успішного створення
    },
    onError: (error) => {
      toast.error(`Error creating note: ${error.message}`); // Повідомлення про помилку
    },
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        // Викликаємо мутацію створення нотатки
        createNoteMutation.mutate(values);
        // Formik автоматично встановлює isSubmitting в false після завершення onSubmit
        // resetForm тут, щоб очистити форму, але це відбувається після мутації
        resetForm();
      }}
    >
      {() => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" type="text" name="title" className={css.input} />
            {/* FormikErrorMessage відображає помилку, якщо поле торкнулися і є помилка */}
            <FormikErrorMessage
              name="title"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              as="textarea"
              id="content"
              name="content"
              rows={8}
              className={css.textarea}
            />
            <FormikErrorMessage
              name="content"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field as="select" id="tag" name="tag" className={css.select}>
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <FormikErrorMessage
              name="tag"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={createNoteMutation.isPending} // Вимикаємо кнопку під час сабміту
            >
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
