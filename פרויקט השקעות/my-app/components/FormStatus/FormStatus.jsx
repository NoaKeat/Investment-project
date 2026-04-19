import styles from "./FormStatus.module.css";

export default function FormStatus({ status, message }) {
  // 👇 לא מציגים כלום בזמן loading
  if (!status || status === "idle" || status === "loading") return null;

  return (
    <div className={`${styles.status} ${styles[status]}`}>
      {message}
    </div>
  );
}