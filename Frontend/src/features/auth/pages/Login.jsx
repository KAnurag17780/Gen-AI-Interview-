import React, { useState } from 'react'
import "../auth.form.scss"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from '../hooks/userAuth'

function Login() {
  const { loading, handleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const from = location.state?.from?.pathname || "/home"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter your email and password.")
      return
    }

    try {
      await handleLogin({ email: trimmedEmail, password })
      navigate(from, { replace: true })
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Login failed. Please try again.")
    }
  }

  if (loading) {
    return (
      <main className="auth-page">
        <div className="form-container" style={{ textAlign: "center" }}>
          <p className="auth-subtitle">Authenticating…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <div className="form-container">
        <header className="auth-header">
          <p className="auth-kicker">
            <span>portal access</span>
            <span className="kicker-tag">#01</span>
          </p>
          <h1>sign in</h1>
          <p className="auth-subtitle">Enter your credentials to access your interview intelligence reports.</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              name="email"
              placeholder="name@company.com"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button className="button primary-button auth-submit-btn" type="submit">
            Sign in →
          </button>
        </form>

        {errorMessage && (
          <p className="auth-error" role="alert">{errorMessage}</p>
        )}

        <footer className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/register">Register</Link>
        </footer>
      </div>
    </main>
  )
}

export default Login
