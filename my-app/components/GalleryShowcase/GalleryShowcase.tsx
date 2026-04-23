import Image from "next/image";
import styles from "./GalleryShowcase.module.css";
import data from "@/data/gallery.json";

export default function GalleryShowcase() {

  const MoneyIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.35508 0C3.2995 0 0.000244141 3.29926 0.000244141 7.35484C0.000244141 11.4104 3.2995 14.7097 7.35508 14.7097C11.4107 14.7097 14.7099 11.4104 14.7099 7.35484ZM7.35508 14.0968C3.63782 14.0968 0.613147 11.0721 0.613147 7.35484C0.613147 3.63758 3.63782 0.612903 7.35508 0.612903C11.0723 0.612903 14.097 3.63758 14.097 7.35484C14.097 11.0721 11.0723 14.0968 7.35508 14.0968Z" fill="white" />
    </svg>
  );

  const Dot = ({ active }: { active?: boolean }) => (
    <svg width="4" height="4" viewBox="0 0 4 4">
      <circle cx="2" cy="2" r="2" fill={active ? "white" : "rgba(255,255,255,0.4)"} />
    </svg>
  );

  const Arrow = () => (
    <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
      <path d="M0.707001 12.684L0 11.977L5.281 6.696C5.375 6.601 5.427 6.476 5.427 6.342C5.427 6.208 5.375 6.083 5.281 5.988L0 0.707L0.707001 0L5.988 5.281C6.271 5.564 6.427 5.941 6.427 6.342C6.427 6.743 6.271 7.119 5.988 7.403L0.707001 12.684Z" fill="white" />
    </svg>
  );

  const LocationIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.49828 14.9994L7.05828 14.6275C5.68203 13.4631 1.19141 9.4225 1.19141 6.30687C1.19141 2.82937 4.02078 0 7.49828 0C10.9758 0 13.8052 2.82937 13.8052 6.30687C13.8052 9.4225 9.31453 13.4631 7.93828 14.6275L7.49828 14.9994Z" stroke="white" strokeWidth="1" fill="none" />
      <circle cx="7.5" cy="6.25" r="1.8" stroke="white" strokeWidth="1" fill="none" />
    </svg>
  );

  const BuildingIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect width="15" height="15" fill="white" opacity="0.2" />
    </svg>
  );

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "money":
        return <MoneyIcon />;
      case "location":
        return <LocationIcon />;
      case "building":
        return <BuildingIcon />;
      default:
        return null;
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.dots}>
        <Dot />
        <Dot active />
        <Dot />
        <Dot />
        <Dot />
        <Dot />
      </div>

      <div className={styles.gallery}>
        <div className={styles.arrowRight}>
          <Arrow />
        </div>

        <div className={styles.arrowLeft}>
          <Arrow />
        </div>

        <div className={`${styles.sideImage} ${styles.left}`}>
          <Image src={data.images.left} alt="left" fill className={styles.image} />
          <div className={styles.overlay}></div>
        </div>

        <div className={styles.mainImage}>
          <Image src={data.images.center} alt="main" fill className={styles.image} />
        </div>

        <div className={`${styles.sideImage} ${styles.right}`}>
          <Image src={data.images.right} alt="right" fill className={styles.image} />
          <div className={styles.overlay}></div>
        </div>
      </div>

      <div className={styles.info}>
        {data.info.map((item, index) => (
          <div key={index} className={styles.item}>
            {renderIcon(item.icon)}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}