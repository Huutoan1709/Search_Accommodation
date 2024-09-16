import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './components/GlobalStyles';
import './output.css';
import UserProvider from './context/UserProvider'; // Import the provider
import PostProvider from './context/PostContext';

ReactDOM.render(
    <React.StrictMode>
        <UserProvider>
            <GlobalStyles />
            <App />
        </UserProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);

reportWebVitals();
