import "./globals.css";

export const metadata = {
  title: "축제 행운 & 사주 자판기",
  description: "영수증으로 뽑아보는 오늘의 운세와 사주 레포트",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
