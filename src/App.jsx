import { useState, useEffect } from 'react';
import './index.css';

const API_URL = 'https://api.freeapi.app/api/v1/public/randomjokes';

function App() {
  const [jokes, setJokes] = useState([]);
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('jokes-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jokes-theme', theme);
  }, [theme]);

  const fetchJokes = async (p) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}?page=${p}&limit=10`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch');
      setJokes(json.data.data);
      setTotalPages(json.data.totalPages);
      setTotalItems(json.data.totalItems);
      setIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJokes(page); }, [page]);

  const joke = jokes[index];
  const globalIndex = (page - 1) * 10 + index + 1;

  const goNext = () => {
    if (index < jokes.length - 1) {
      setIndex(i => i + 1);
    } else if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex(i => i - 1);
    } else if (page > 1) {
      setPage(p => p - 1);
      setIndex(9);
    }
  };

  const handleCopy = async () => {
    if (!joke) return;
    try {
      await navigator.clipboard.writeText(joke.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const getCatClass = (cat) => {
    if (cat === 'explicit') return 'joke-cat-explicit';
    if (cat === 'dev' || cat === 'nerdy') return 'joke-cat-dev';
    return 'joke-cat-default';
  };

  const isFirst = page === 1 && index === 0;
  const isLast = page >= totalPages && index >= jokes.length - 1;

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <span className="emoji">😂</span> JokePad
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
        </div>
      </nav>

      <main className="main">
        <div className="hero-text">
          <h1>Ready to <span className="accent">laugh</span>?</h1>
          <p>One joke at a time. Tap next for another dose of humor.</p>
        </div>

        {error && (
          <div className="error-state">
            <h2>Oops!</h2>
            <p>{error}</p>
          </div>
        )}

        {!error && joke && (
          <div className="joke-card" key={joke.id}>
            <span className="joke-quote">"</span>
            <p className="joke-content">{joke.content}</p>
            <div className="joke-footer">
              <span className="joke-id">#{joke.id}</span>
              {joke.categories.length > 0 && (
                <>
                  <span className="joke-divider"></span>
                  <div className="joke-categories">
                    {joke.categories.map(c => <span key={c} className={`joke-cat ${getCatClass(c)}`}>{c}</span>)}
                  </div>
                </>
              )}
              <span className="joke-divider"></span>
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                {copied ? (
                  <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy</>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="actions">
          <button className="prev-btn" onClick={goPrev} disabled={isFirst || isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="next-btn" onClick={goNext} disabled={isLast || isLoading}>
            {isLoading ? <div className="spinner"></div> : (
              <>
                Next Joke
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </>
            )}
          </button>
        </div>

        {!isLoading && totalItems > 0 && (
          <div className="counter">{globalIndex} of {totalItems}</div>
        )}
      </main>
    </>
  );
}

export default App;
