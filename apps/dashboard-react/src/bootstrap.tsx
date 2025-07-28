import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
      // <-- importa sua store
import './index.css';
import Dashboard from './pages/dashboard/Dashboard';
import StoreProvider from "../../store/StoreProvider";
const container = document.getElementById('root');
if (container) {
  ReactDOM.render(
    <StoreProvider>              {/* <-- adiciona o Provider aqui */}
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </StoreProvider>,
    container
  );
}

export {};
