import React, { useState } from 'react'
import "../auth.form.scss"
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from "../hooks/userAuth"

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const from = location.state?.from?.pathname || "/home"

  const { loading, handleRegister } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()

    if (!trimmedUsername || !trimmedEmail || !password) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    try {
      await handleRegister({ username: trimmedUsername, email: trimmedEmail, password })
      navigate(from, { replace: true })
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Registration failed. Please try again.")
    }
  }

  if (loading) {
    return (
      <main className="auth-page">
        <div className="form-container" style={{ textAlign: "center" }}>
          <p className="auth-subtitle">Creating account…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <div className="form-container">
        <header className="auth-header">
          <p className="auth-kicker">
            <span>new account</span>
            <span className="kicker-tag">#02</span>
          </p>
          <h1>create account</h1>
          <p className="auth-subtitle">Join to generate tailored readiness reports from resumes and job descriptions.</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              id="username"
              name="username"
              placeholder="e.g. alex_dev"
              autoComplete="username"
            />
          </div>

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
              autoComplete="new-password"
            />
          </div>

          <button className="button primary-button auth-submit-btn" type="submit">
            Create account →
          </button>
        </form>

        {errorMessage && (
          <p className="auth-error" role="alert">{errorMessage}</p>
        )}

        <footer className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </footer>
      </div>
    </main>
  )
}

export default Register
