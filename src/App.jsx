import React, { useState, useEffect } from 'react';
import './App.css';
import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const OMDB_API_KEY = "your_omdb_api_key_here";

function App() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [collection, setCollection] = useState([]);

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserCollection(currentUser.uid);
      } else {
        setUser(null);
        setCollection([]);
      }
    });
  }, []);

  const fetchUserCollection = async (uid) => {
    const docRef = doc(db, 'collections', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setCollection(docSnap.data().movies || []);
    } else {
      await setDoc(docRef, { movies: [] });
      setCollection([]);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSearch = async () => {
    const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${query}`);
    const data = await res.json();
    if (data.Search) {
      const details = await Promise.all(
        data.Search.map(async (movie) => {
          const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}&plot=short`);
          return res.json();
        })
      );
      setResults(details);
    } else {
      setResults([]);
    }
  };

  const addToCollection = async (movie) => {
    const uid = user.uid;
    const docRef = doc(db, 'collections', uid);
    await updateDoc(docRef, {
      movies: arrayUnion(movie),
    });
    setCollection((prev) => [...prev, movie]);
  };

  return (
    <div className="App">
      <h1>🎬 Movie Finder</h1>
      {!user ? (
        <button className="btn" onClick={handleLogin}>Sign in with Google</button>
      ) : (
        <>
          <div className="user-info">
            <img src={user.photoURL} alt="User" />
            <p>Welcome, {user.displayName}</p>
            <button className="btn logout" onClick={handleLogout}>Logout</button>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn" onClick={handleSearch}>Search</button>
          </div>
          <div className="results">
            {results.map((movie) => (
              <div className="card" key={movie.imdbID}>
                <img src={movie.Poster} alt={movie.Title} />
                <h2>{movie.Title}</h2>
                <p><strong>Actors:</strong> {movie.Actors}</p>
                <p><strong>Plot:</strong> {movie.Plot}</p>
                <button className="btn add" onClick={() => addToCollection(movie)}>Add to Collection</button>
              </div>
            ))}
          </div>

          <h2>🎥 Your Collection</h2>
          <div className="collection">
            {collection.map((movie, index) => (
              <div className="card" key={index}>
                <img src={movie.Poster} alt={movie.Title} />
                <h2>{movie.Title}</h2>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
