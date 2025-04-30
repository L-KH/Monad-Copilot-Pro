// This is a compatibility layer for react-syntax-highlighter
// It imports the CJS version which is more stable with Next.js
import vs2015 from 'react-syntax-highlighter/dist/cjs/styles/hljs/vs2015';
import docco from 'react-syntax-highlighter/dist/cjs/styles/hljs/docco';
import github from 'react-syntax-highlighter/dist/cjs/styles/hljs/github';
import monokai from 'react-syntax-highlighter/dist/cjs/styles/hljs/monokai';

// Export the styles
export {
  vs2015,
  docco,
  github,
  monokai
};

// Default export for convenience
export default vs2015;
