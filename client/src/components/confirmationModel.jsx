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
                toast.success(`${movieTitle} removed from favorites`);
                onDeleted();
                onClose();
            })
        } catch (err) {
            console.log(err.response?.data);
            toast.error(`Failed to delete from favorites`);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-sm w-full mx-4">
                <p className="text-lg mb-6">Remove <span className="font-bold">{movieTitle}</span> from favorites?</p>
                <div className="flex justify-end gap-4">
                    <button className="px-4 py-2 text-gray-400 hover:text-white text-sm cursor-pointer" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg text-white text-sm cursor-pointer" onClick={handleConfirmation}>
                        Remove
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModel;
