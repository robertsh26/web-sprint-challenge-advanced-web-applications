import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => {
    navigate('/')
   }
  const redirectToArticles = () => { 
    navigate('/articles')
  }

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    localStorage.removeItem('token')
    // and a message saying "Goodbye!" should be set in its proper state.
    setMessage("Goodbye!")
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    redirectToLogin()
  }

  const login = async ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    setMessage('')
    setSpinnerOn(true)

    // and launch a request to the proper endpoint.
    axios.post(loginUrl, { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.token)
        setMessage(res.data.message)
        navigate('/articles');
      })
      .catch(err => {
        console.error(err)
        setMessage('Login failed')
      })
      .finally(() => {
        setSpinnerOn(false)
      })
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
  }

  const getArticles = async () => {
    setMessage('');
    setSpinnerOn(true);

    console.log('gettin articles')

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(articlesUrl, { headers: { Authorization: token } });
  
      if (response.status === 200) {
        setArticles(response.data.articles);
        setMessage(response.data.message);
      } else {
        console.error('Unexpected status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      if (error.response && error.response.status === 401) {
        redirectToLogin();
      }
    } finally {
      setSpinnerOn(false);
    }
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
  };

  const postArticle = async (article) => {
    setMessage('');
    setSpinnerOn(true);

    const token = localStorage.getItem('token')
    axios.post(articlesUrl, article, { headers: { Authorization: token } })
      .then(res => {
        setArticles([...articles, res.data.article])
        setMessage(res.data.message)
      })
      .catch(err => {
        console.error(err)
        if (err.response.status === 401) {
          redirectToLogin()
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
  };

  const updateArticle = async ({ article_id, article }) => {
    setMessage('');
    setSpinnerOn(true);
  
    const token = localStorage.getItem('token')
    axios.put(`${articlesUrl}/${article_id}`, article, { headers: { Authorization: token } })
      .then(res => {
        setArticles(articles.map(art => (art.article_id === article_id ? res.data.article : art)))
        setMessage(res.data.message)
        setCurrentArticleId(null);
      })
      .catch(err => {
        console.error(err)
        if (err.response.status === 401) {
          redirectToLogin()
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  
    // ✨ implement
    // You got this!
  };

  const deleteArticle = async (article_id) => {
    setMessage('');
    setSpinnerOn(true);
  
    const token = localStorage.getItem('token')
    axios.delete(`${articlesUrl}/${article_id}`, { headers: { Authorization: token } })
      .then(res => {
        setArticles(articles.filter(art => art.article_id !== article_id))
        setMessage(res.data.message)
      })
      .catch(err => {
        console.error(err)
        if (err.response.status === 401) {
          redirectToLogin()
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  
    // ✨ implement
  };

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm 
                postArticle={postArticle} 
                updateArticle={updateArticle} 
                setCurrentArticleId={setCurrentArticleId} 
                currentArticle={articles.find(art => art.article_id === currentArticleId)} 
              />
              <Articles 
                articles={articles} 
                getArticles={getArticles} 
                deleteArticle={deleteArticle} 
                setCurrentArticleId={setCurrentArticleId} 
                currentArticleId={currentArticleId} 
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
