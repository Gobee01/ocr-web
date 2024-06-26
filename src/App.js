import React, {Suspense, useEffect} from 'react'
import {BrowserRouter as Router} from "react-router-dom";
import './App.css';
import './shared/shared.scss';
import Loader from './utils/loader';
import {ErrorBoundary} from 'react-error-boundary';
import ErrorFallback from './utils/error-fallback';
import MainLayout from './components/layouts/main-layout';
import {toast} from "react-toastify";

function App() {

  useEffect(() => {
    toast.configure({
      position: toast.POSITION.BOTTOM_RIGHT
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <Loader/>
        <ErrorBoundary FallbackComponent={ErrorFallback}
                       onReset={() => {
                       }}>
          <Suspense fallback={<Loader load={true}/>}>
            <MainLayout />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
