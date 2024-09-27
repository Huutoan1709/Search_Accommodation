import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicroutes, privateRoutes } from './routes';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import { ToastManager } from './components/ToastManager';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {publicroutes.map((route, index) => {
                        return <Route key={index} path={route.path} element={<route.component />} />;
                    })}

                    {privateRoutes.map((route, index) => {
                        return (
                            <Route key={index} path={route.path} element={<PrivateRoute element={route.component} />} />
                        );
                    })}
                </Routes>
                <ToastManager />
            </div>
        </Router>
    );
}

export default App;
