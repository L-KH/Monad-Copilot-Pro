// The index page is only needed for Next.js to work correctly
// Our actual routing is handled by React Router in App.js
export default function Home() {
  return null;
}

// This ensures Next.js renders this page on the client side only
export const getStaticProps = async () => {
  return {
    props: {}
  };
};
