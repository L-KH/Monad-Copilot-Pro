import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is used when accessing the root URL in our React Router setup
// It simply redirects to the Dashboard page
const IndexPage = () => {
  return <Navigate to="/" replace />;
};

export default IndexPage;
