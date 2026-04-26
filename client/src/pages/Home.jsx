import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Star, ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';
import languages from '../utils/languages.json';

const Home = () => {

    const [movies, setMovies] = useState([]);
    const [totalPages, setTotalPages] = useState([]);
    const [pageValue, setPageValue] = useState(1);
    const [language, setLanguage] = useState(localStorage.getItem('selectedLanguage') || 'te');

    useEffect(() => {
        axios.get(`http://localhost:3000/api/movies/?page=${pageValue}&&language=${language}`).then(res => {
            setMovies(res.data.movies), setTotalPages(res.data.total_pages)
        });
    }, [pageValue, language]);

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        localStorage.setItem('selectedLanguage', e.target.value);
    }

    return (
        <div className="flex flex-col gap-2 cursor-pointer">
            <div className="flex justify-between p-10">
                <div className="relative">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="appearance-none bg-white/10 backdrop-blur-md w-60 text-white px-4 py-2 rounded-lg cursor-pointer border border-white/20 outline-none"
                    >
                        {languages.map(lang => (
                            <option key={lang.iso_639_1} value={lang.iso_639_1} className="bg-[#1a1a2e] text-white">
                                {lang.english_name}
                            </option>
                        ))}
                    </select>
                    {/*<ChevronDown className="absolute right-3.5 top-3.5 text-white pointer-events-none" size={16} />*/}
                </div>
                <div className="flex gap-3 items-center justify-end">
                    <span className="text-gray-400 text-sm">Page</span>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg">
                        <ChevronLeft
                            size={18}
                            className="text-gray-400 hover:text-white cursor-pointer transition"
                            onClick={() => pageValue > 1 && setPageValue(pageValue - 1)}
                        />
                        <input
                            type="number"
                            value={pageValue}
                            onChange={(e) => setPageValue(Number(e.target.value))}
                            min="1"
                            max={totalPages}
                            step="1"
                            className="caret-white bg-wwhite/10 text-white border border-yellow-500 w-12 h-7 text-center text-sm rounded"
                        />
                        <span className="text-gray-400 text-sm">of {totalPages}</span>
                        <ChevronRight
                            size={18}
                            className="text-gray-400 hover:text-white cursor-pointer transition"
                            onClick={() => pageValue < totalPages && setPageValue(pageValue + 1)}
                        />
                    </div>
                </div>
            </div>
            {/*<div className="flex gap-2 justify-end">
                    <p> Page : </p>
                    <input
                        type="number"
                        value={pageValue}
                        onChange={(e) => setPageValue(Number(e.target.value))}
                        min="1"
                        max={totalPages}
                        step="1"
                        className="caret-black bg-white text-black w-14 h-8 pl-2 rounded"
                    />
                    <div className="flex gap-1">
                        <span> of {totalPages}</span>
                        <ChevronRight size={24} onClick={() => setPageValue(Number(pageValue + 1))} />
                    </div>
                </div>
            </div> */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 p-10">
                {movies.map(movie => (
                    <Link to={`/movie/${movie.id}`} key={movie.id}>
                        <div className="bg-gray-800/50 rounded-lg overflow-hidden hover:scale-105 transition duration-300">
                            {movie.poster_path ? (
                                <img
                                    className="w-full h-84 object-cover"
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                    alt={movie.title}
                                />
                            ) : (
                                <div className="w-full h-84 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg shadow-lg flex flex-col items-center justify-center p-6">
                                    <span className="text-gray-400 text-center">{movie.title}</span>
                                    <span className="text-gray-500 text-sm">No poster available</span>
                                </div>
                            )}
                            <div className="flex justify-between p-3">
                                <h3 className="text-white text-l font-bold line-clamp-1">{movie.title}</h3>
                                <div className="flex items-center gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < Math.round(movie.rating / 3) ? "fill-yellow-500 stroke-none" : "fill-gray-600 stroke-none"}
                                        />
                                    ))}
                                    <span className="text-gray-400 text-sm ml-1">{movie.rating}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Home

