import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <style>
          {
            `
              ::-webkit-scrollbar {
                width: 20px;
              }
            `
          }
        </style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
