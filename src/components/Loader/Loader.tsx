import css from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={css.loaderBackdrop}>
      <div className={css.spinner}></div>
      <p className={css.loadingText}>Loading...</p>
    </div>
  );
}
