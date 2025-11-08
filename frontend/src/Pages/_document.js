import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Tambahkan script Font Awesome dengan defer */}
        <script
          src="https://kit.fontawesome.com/a7df75a8c0.js"
          crossOrigin="anonymous"
          defer
        ></script>
        <link rel="icon" href="/favicon.ico"></link>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="antialiased font-rubik">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}