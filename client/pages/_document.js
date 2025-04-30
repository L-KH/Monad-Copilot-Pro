import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="#000000" />
          <meta
            name="description"
            content="Monad Copilot Pro - Build, deploy, and monitor smart contracts on Monad"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body className="bg-gray-100 dark:bg-gray-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
