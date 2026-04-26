import { BrowserRouter, Routes, Route } from 'react-router-dom';
import socket from './utils/socket.js';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails.jsx';
import Header from './components/header.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx';
import Logout from './pages/Logout.jsx';
import TimeLine from './pages/TimeLine.jsx';
import FriendsPage from './pages/friendsPage.jsx';
import FriendsFavorites from './pages/FriendFavorites.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
// App.jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';



if (socket) {
    socket.on('friend-request', (data) => {
        toast.info(data.message);
    });

    socket.on('request-accepted', (data) => {
        toast.success(data.message);
    })
}

function App() {
    return (
        <BrowserRouter>
            <Header />
            <ToastContainer />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="movie/:id" element={<MovieDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/timeline" element={<TimeLine />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/friends/:friendId/favorites" element={<FriendsFavorites />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
