import React from 'react'
import "../auth.form.scss" 
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from '../hooks/userAuth'
import { useState } from 'react'


function Login() {

  const {loading , handleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email , setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const from = location.state?.from?.pathname || "/home"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("")

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter your email and password.")
      return
    }

    try {
      await handleLogin({ email: trimmedEmail, password });
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Login failed. Please try again.")
    }
  }

  if(loading)
  {
    return (<main><p>Loading...</p></main>)
  }

  return (
    <main>
      <div className='form-container'>
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>

          <div className='input-group'  >
              <label htmlFor="email">Email</label>
              <input
              onChange ={(e) => {setEmail(e.target.value)}}
               type="email" id='email' name='email' placeholder='Enter your email' />
          </div>

          <div className='input-group'  > 
              <label htmlFor="password">Password</label>
              <input 
              onChange ={(e) => {setPassword(e.target.value)}}
              type="password" id='password' name='password' placeholder='Enter your password' />
          </div>
          <button  className=' button primary-button' type='submit'>Login</button>
        </form>
        {errorMessage && <p role="alert">{errorMessage}</p>}
         <p>Dont have an account ? <Link to={"/register"} >Register</Link> </p>
      </div>
    </main>
  );
}

export default Login;
