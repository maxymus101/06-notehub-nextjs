import css from "./loading.module.css";

const Loading = () => {
  return (
    <div className={css.loaderBackdrop}>
      <div className={css.spinner}></div>
      <p className={css.loadingText}>Loading...</p>
    </div>
  );
};

export default Loading;
