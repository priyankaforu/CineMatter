import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
/*import MovieDetails from './pages/MovieDetails.jsx';*/

function App(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
