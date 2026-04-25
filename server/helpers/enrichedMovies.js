import pool from '../configs/db.js';

const fields = ['title', 'release_date', 'id', 'overview', 'poster_path'];

export const enrichMovies = async (results) => {
    const movies = results.map((item) =>
        Object.fromEntries(Object.entries(item).filter(([key]) => fields.includes(key)))
    );

    const enrichedMovies = await Promise.all(movies.map(async (movie) => {
        const ratings = await pool.query(
            'SELECT AVG(rating) as average_rating, COUNT(rating) as total_ratings, COUNT(review_text) as total_reviews FROM ratings WHERE tmdb_movie_id = $1',
            [movie.id]
        );
        return {
            ...movie,
            rating: parseFloat(ratings.rows[0].average_rating) || 0,
            total_ratings: parseInt(ratings.rows[0].total_ratings) || 0,
            total_reviews: parseInt(ratings.rows[0].total_reviews) || 0
        };
    }));

    return enrichedMovies;
};
