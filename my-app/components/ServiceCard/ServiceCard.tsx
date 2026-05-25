import Link from "next/link";
import styles from "../Services/Services.module.css";
import cardStyles from "./ServiceCard.module.css";
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
    <div className={`${styles.card} ${cardStyles.card}`}>
      <span className={`${styles.tag} ${cardStyles.tag}`}>{service.tag}</span>
      <h3 className={cardStyles.title}>{service.title}</h3>
      <p className={cardStyles.description}>{service.description}</p>

      <Link
        href={`/meetings/${service.slug}`}
        className={`${styles.button} ${cardStyles.button}`}
      >
        {service.buttonText}
      </Link>
    </div>
  );
}