import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Card, Row, Col, Form, Table } from 'react-bootstrap';
import UserContext from '../context/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'notyf/notyf.min.css';
import axios from 'axios';

export default function MoviePage() {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Array of image URLs for the random pictures
  const imageArray = [
    'https://static.vecteezy.com/system/resources/thumbnails/029/796/026/small_2x/asian-girl-anime-avatar-ai-art-photo.jpg',
    'https://www.shutterstock.com/image-vector/dynamic-anime-warrior-flaming-sword-600nw-2497103109.jpg',
    'https://static.vecteezy.com/system/resources/thumbnails/026/727/545/small_2x/girl-anime-sitting-in-the-city-free-photo.jpg',
    'https://i.pinimg.com/736x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg',
    'https://play-lh.googleusercontent.com/7Ac5TgaL15Ra4bvFVHJKCdJp4qvnL4djZj5bKc6RN-MZjzrvkeHbJytek0NPTSdZcp8',
    'https://i.pinimg.com/736x/42/d4/88/42d488faa741aebfa5856d07fb3cb35e.jpg',
    'https://i.pinimg.com/736x/7c/21/db/7c21dbdf5870a32a3e5fa570f9c770e8.jpg',
    'https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/52682ed7-3807-449a-a2b4-5b66503a7345/cb85a932-af7a-4968-b44b-21815be2a528.png',
    'https://i.pinimg.com/736x/85/53/dd/8553ddd316e61fe8f4830fa980ab18d6.jpg',
    'https://i.pinimg.com/736x/d5/28/52/d52852dc29b001b7934ea357235c5113.jpg',
    'https://cdn.lazyshop.com/files/9b0d8bde-34c0-460a-b131-e7a87b1e0543/other/fbc0fc3641ab3ba6124bf77ba08538a4.jpg',
    'https://i.pinimg.com/736x/8e/fd/40/8efd40188e5183beea1a0a2ae2a34ac0.jpg',
  ];

  useEffect(() => {
    // Fetch the list of movies when the component mounts
    const fetchMovies = async () => {
      try {
        const response = await axios.get('https://movieapp-api-lms1.onrender.com/movies/getMovies');
        setMovies(response.data.movies);
      } catch (error) {
        setError('Error fetching movies');
        console.error(error);
      }
    };
    fetchMovies();
  }, []);

  const handleAddMovie = () => {
    navigate('/add-movie');
  };

  const handleDeleteMovie = async (movieId) => {
    try {
      await axios.delete(`https://movieapp-api-lms1.onrender.com/movies/deleteMovie/${movieId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMovies(movies.filter((movie) => movie._id !== movieId)); // Remove movie from state
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  const handleAddComment = async (movieId, comment) => {
    try {
      await axios.patch(
        `https://movieapp-api-lms1.onrender.com/movies/addComment/${movieId}`,
        { comment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Refresh the movies after adding comment
      const updatedMovies = [...movies];
      const movieIndex = updatedMovies.findIndex((movie) => movie._id === movieId);
      if (movieIndex !== -1) {
        updatedMovies[movieIndex].comments.push({ userId: user.id, comment });
        setMovies(updatedMovies);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <Container>
      <h1>Movies</h1>
      {error && <p>{error}</p>}

      {user && user.isAdmin ? (
        <div>
          <Button variant="primary" onClick={handleAddMovie} className="mb-3">
            Add Movie
          </Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Genre</th>
                <th>Year</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie._id}>
                  <td>{movie.title}</td>
                  <td>{movie.description}</td>
                  <td>{movie.genre}</td>
                  <td>{movie.year}</td>
                  <td>
                    {movie.comments.length > 0 ? (
                      <ul>
                        {movie.comments.map((comment, idx) => (
                          <li key={idx}>
                            {comment.comment} - <em>{comment.userId}</em>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No comments yet</p>
                    )}
                  </td>
                  <td>
                    <Button variant="warning" onClick={() => handleDeleteMovie(movie._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div>
          <Row xs={1} md={2} lg={3} className="g-4">
            {movies.map((movie) => {
              // Randomly pick an image from the array
              const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];

              return (
                <Col key={movie._id}>
                  <Card>
                    <Card.Img variant="top" src={randomImage} alt="Movie poster" />
                    <Card.Body>
                      <Card.Title>{movie.title}</Card.Title>
                      <Card.Text>{movie.description}</Card.Text>
                      <p><strong>Genre:</strong> {movie.genre} | <strong>Year:</strong> {movie.year}</p>
                      <h6>Comments:</h6>
                      {movie.comments.length > 0 ? (
                        <ul>
                          {movie.comments.map((comment, idx) => (
                            <li key={idx}>
                              {comment.comment} - <em>{comment.userId}</em>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No comments yet</p>
                      )}
                      {user && !user.isAdmin && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Add a comment"
                          onBlur={(e) => handleAddComment(movie._id, e.target.value)}
                        />
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </Container>
  );
}
