import { Noto_Sans_Hebrew } from "next/font/google";
import localFont from "next/font/local";

export const noto = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto", // חשוב!
});
export const leon = localFont({
  src: [
    {
      path: "../public/fonts/Leon-Regular.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/Leon-Bold.woff2",
      weight: "700",
    },
  ],
  variable: "--font-leon",
});
