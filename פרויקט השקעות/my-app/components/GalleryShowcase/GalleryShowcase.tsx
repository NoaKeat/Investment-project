"use client";
import Image from "next/image";
import styles from "./GalleryShowcase.module.css";
import { useEffect, useState } from "react";

interface GalleryInfo {
  icon: string;
  text: string;
}

interface GalleryData {
  images: {
    left: string;
    center: string;
    right: string;
  };
  info: GalleryInfo[];
}

export default function GalleryShowcase() {
  const [data, setData] = useState<GalleryData | null>(null);

  useEffect(() => {
    fetch("/gallery.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const MoneyIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.35508 0C3.2995 0 0.000244141 3.29926 0.000244141 7.35484C0.000244141 11.4104 3.2995 14.7097 7.35508 14.7097C11.4107 14.7097 14.7099 11.4104 14.7099 7.35484ZM7.35508 14.0968C3.63782 14.0968 0.613147 11.0721 0.613147 7.35484C0.613147 3.63758 3.63782 0.612903 7.35508 0.612903C11.0723 0.612903 14.097 3.63758 14.097 7.35484C14.097 11.0721 11.0723 14.0968 7.35508 14.0968Z" fill="white" />
      <path d="M9.8067 5.82258V6.12903H9.19379V5.82258C9.19379 5.31571 8.78131 4.90323 8.27444 4.90323H6.43573C5.92886 4.90323 5.51637 5.31571 5.51637 5.82258C5.51637 6.35948 5.90128 6.81058 6.43082 6.89577L8.37618 7.20835C9.20544 7.34135 9.8067 8.04803 9.8067 8.8871C9.8067 9.73229 9.11963 10.4194 8.27444 10.4194H7.66153V11.6452H7.04863V10.4194H6.43573C5.59053 10.4194 4.90347 9.73229 4.90347 8.8871V8.58065H5.51637V8.8871C5.51637 9.39397 5.92886 9.80645 6.43573 9.80645H8.27444C8.78131 9.80645 9.19379 9.39397 9.19379 8.8871C9.19379 8.35019 8.80889 7.8991 8.27934 7.8139L6.33399 7.50132C5.50473 7.36832 4.90347 6.66226 4.90347 5.82258C4.90347 4.978 5.59053 4.29032 6.43573 4.29032H7.04863V3.06452H7.66153V4.29032H8.27444C9.11963 4.29032 9.8067 4.978 9.8067 5.82258Z" fill="white" />
    </svg>
  );

  const Dot = ({ active }: { active?: boolean }) => (
    <svg width="4" height="4" viewBox="0 0 4 4">
      <circle
        cx="2"
        cy="2"
        r="2"
        fill={active ? "white" : "rgba(255,255,255,0.4)"}
      />
    </svg>
  );

  const Arrow = () => (
    <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
      <path
        d="M0.707001 12.684L0 11.977L5.281 6.696C5.375 6.601 5.427 6.476 5.427 6.342C5.427 6.208 5.375 6.083 5.281 5.988L0 0.707L0.707001 0L5.988 5.281C6.271 5.564 6.427 5.941 6.427 6.342C6.427 6.743 6.271 7.119 5.988 7.403L0.707001 12.684Z"
        fill="white"
      />
    </svg>
  );

  const LocationIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M7.49828 14.9994L7.05828 14.6275C5.68203 13.4631 1.19141 9.4225 1.19141 6.30687C1.19141 2.82937 4.02078 0 7.49828 0C10.9758 0 13.8052 2.82937 13.8052 6.30687C13.8052 9.4225 9.31453 13.4631 7.93828 14.6275L7.49828 14.9994Z"
        stroke="white"
        strokeWidth="1"
        fill="none"
      />
      <circle
        cx="7.5"
        cy="6.25"
        r="1.8"
        stroke="white"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );

  const BuildingIcon = () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <g clipPath="url(#clip0_building)">
        <path d="M2.45161 7.96774H4.29032V8.58065H2.45161V7.96774ZM2.45161 11.0323H4.29032V10.4194H2.45161V11.0323ZM5.51613 11.0323H7.35484V10.4194H5.51613V11.0323ZM2.45161 3.67742H4.29032V3.06452H2.45161V3.67742ZM2.45161 6.12903H4.29032V5.51613H2.45161V6.12903ZM5.51613 8.58065H7.35484V7.96774H5.51613V8.58065ZM5.51613 3.67742H7.35484V3.06452H5.51613V3.67742ZM5.51613 6.12903H7.35484V5.51613H5.51613V6.12903ZM11.0323 11.0323H12.2581V10.4194H11.0323V11.0323ZM11.0323 6.12903H12.2581V5.51613H11.0323V6.12903ZM11.0323 8.58065H12.2581V7.96774H11.0323V8.58065ZM14.7097 4.59677V14.7097H0V1.53226C0 0.687065 0.687677 0 1.53226 0H8.27419C9.11877 0 9.80645 0.687065 9.80645 1.53226V3.06452H13.1774C14.022 3.06452 14.7097 3.75158 14.7097 4.59677ZM9.19355 1.53226C9.19355 1.02539 8.78106 0.612903 8.27419 0.612903H1.53226C1.02539 0.612903 0.612903 1.02539 0.612903 1.53226V14.0968H9.19355V1.53226ZM14.0968 4.59677C14.0968 4.0899 13.6843 3.67742 13.1774 3.67742H9.80645V14.0968H14.0968V4.59677Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_building">
          <rect width="14.7097" height="14.7097" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  if (!data) return null;

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

        {/* שמאל */}
        <div className={`${styles.sideImage} ${styles.left}`}>
          <Image
            src={data.images.left}
            alt="left"
            fill
            className={styles.image}
          />
          <div className={styles.overlay}></div>
        </div>

        {/* מרכז */}
        <div className={styles.mainImage}>
          <Image
            src={data.images.center}
            alt="main"
            fill
            className={styles.image}
          />
        </div>

        {/* ימין */}
        <div className={`${styles.sideImage} ${styles.right}`}>
          <Image
            src={data.images.right}
            alt="right"
            fill
            className={styles.image}
          />
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