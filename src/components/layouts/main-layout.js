import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import UploadDocument from '../pages/upload-document';
import ExtractDocument from '../pages/extraction-page';
import AppHeader from './navbar';

const MainLayout = () => {
  return (
    <Router>
      <div>
      <AppHeader />
        <Switch>
          <Route path="/upload" component={UploadDocument} />
          <Route path="/extract/:documentId" component={ExtractDocument} />
          {/* Default route can be removed if you always want to redirect to /upload or /extract */}
          <Route path="/" component={UploadDocument} />
        </Switch>
      </div>
    </Router>
  );
};

export default MainLayout;