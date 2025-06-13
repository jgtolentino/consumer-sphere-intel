
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to Overview page as the main dashboard
  return <Navigate to="/" replace />;
};

export default Index;
