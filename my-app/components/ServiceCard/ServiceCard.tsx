import Link from "next/link";
import styles from "../Services/Services.module.css";
type Service = {
  id: number;
  tag: string;
  title: string;
  description: string;
  buttonText: string;
  slug: string;
};
type Props = {
  service: Service;
};
export default function ServiceCard({ service }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.tag}>{service.tag}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>

      <Link
        href={`/meetings/${service.slug}`}
        className={styles.button}
      >
        {service.buttonText}
      </Link>
    </div>
  );
}