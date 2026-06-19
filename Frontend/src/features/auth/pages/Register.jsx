import React  ,{useState} from 'react'
import {Link, useLocation, useNavigate } from 'react-router'
import {useAuth} from "../hooks/userAuth"

const  Register = () => {
const navigate = useNavigate()
const location = useLocation()
const [username , setUsername] = useState("")
const [email , setEmail] = useState("")
const [password, setPassword] = useState("")
const [errorMessage, setErrorMessage] = useState("")
const from = location.state?.from?.pathname || "/home"

  const {loading , handleRegister} = useAuth()

   const  handleSubmit = async (e) => 
    {
    e.preventDefault();
    setErrorMessage("")

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()

    if (!trimmedUsername || !trimmedEmail || !password) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    try {
      await handleRegister({ username: trimmedUsername, email: trimmedEmail, password });
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Registration failed. Please try again.")
    }
  }
  if(loading)
  {
    return (<main><p>Loading...</p></main>)
  }

  return (
    
    <main>
      
      <div className='form-container'>
        <h1>Register</h1>
        
        <form onSubmit={handleSubmit}>

          <div className='input-group'  >
              <label htmlFor="email">Username</label>
              <input
              onChange={(e) => setUsername(e.target.value)}
              type="text" id='username' name='username' placeholder='Enter your username' />
          </div>

          <div className='input-group'  >
              <label htmlFor="email">Email</label>
              <input
              onChange={(e) => setEmail(e.target.value)}
              type="email" id='email' name='email' placeholder='Enter your email' />
          </div>

          <div className='input-group'  > 
              <label htmlFor="password">Password</label>
              <input
              onChange={(e) => setPassword(e.target.value)}
              type="password" id='password' name='password' placeholder='Enter your password' />
          </div>
          <button  className=' button primary-button' type='submit'>Register</button>
        </form>
        {errorMessage && <p role="alert">{errorMessage}</p>}
        <p>Already have an account ? <Link to={"/login"} >Login</Link> </p>
      </div>
    </main>
  );
}

export default Register;
