import axios from 'axios';
import { toast } from 'react-toastify';

const ConfirmationModel = ({ isOpen, onClose, movieId, movieTitle, onDeleted }) => {
    if (!isOpen) return null;
    const token = localStorage.getItem('token');
    const handleConfirmation = async (e) => {
        e.preventDefault();
        try {
            await axios.delete("http://localhost:3000/api/favorites", {
                headers: { Authorization: `Bearer ${token}` },
                data: { tmdb_movie_id: movieId }
            }).then(() => {
                toast.success(`${movieTitle} is deleted from the favorites`);
                onDeleted();
                onClose();
            })
        } catch (err) {
            console.log(err.response?.data);
            toast.error(`Failed to delete from favorites`);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
            <div className="flex flex-col gap-4 bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h1 className="text-2xl font-bold">Are You Sure?</h1>
                <p className="text-gray-300">You want to delete "{movieTitle}" from your favorites</p>
                <div className="flex justify-end gap-4 mt-4">
                    <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white cursor-pointer" onClick={onClose}>
                        No
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-red-800 text-white hover:bg-red-500 cursor-pointer" onClick={handleConfirmation}>
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    )
}


export default ConfirmationModel;
