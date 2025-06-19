import ReactPaginate from "react-paginate";
import css from "./Pagination.module.css";

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: ({ selected }: { selected: number }) => void;
}

export default function Pagination({
  pageCount,
  currentPage,
  onPageChange,
}: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <ReactPaginate
      pageCount={pageCount} // Загальна кількість сторінок
      pageRangeDisplayed={5} // Кількість видимих номерів сторінок
      marginPagesDisplayed={1} // Кількість номерів сторінок по краях
      onPageChange={onPageChange} // Обробник зміни сторінки
      forcePage={currentPage - 1} // Примусово встановлює активну сторінку (ReactPaginate використовує 0-індексацію)
      containerClassName={css.pagination} // Клас для контейнера пагінації
      activeClassName={css.active} // Клас для активної сторінки
      nextLabel="→" // Текст для кнопки "Наступна"
      previousLabel="←" // Текст для кнопки "Попередня"
      // Додаткові класи для вимкнених кнопок
      disabledClassName={css.disabled}
      breakClassName={css.break}
      pageLinkClassName={css.pageLink}
      previousLinkClassName={css.prevLink}
      nextLinkClassName={css.nextLink}
    />
  );
}
