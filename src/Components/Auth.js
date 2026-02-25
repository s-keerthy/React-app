import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
    
    setIsLoading(false);
  };

  const handleRegister = async () => {
    try {
      // ---------------------------------------------------------
      // REPLACE THIS URL WITH YOUR REGISTER FLOW HTTP URL
      // ---------------------------------------------------------
      const flowUrl = 'https://931009ff5cfae9318e79fd03a7aec5.02.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/87638db68b3c4893bbb635bfd7f3f3d0/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Z0WY02vAv5LwhXLoHMNAlR4FhBFJKllraBM27yUGAC0';

      const payload = {
        Name: formData.name.trim(),
        EmailID: formData.email.trim(),
        Password: formData.password.trim()
      };

      console.log('Sending registration data:', { eventData: JSON.stringify(payload) });

      // IMPORTANT: Send in the format your flow expects (eventData wrapper)
      const response = await fetch(flowUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ eventData: JSON.stringify(payload) })
      });

      console.log('Registration response status:', response.status);

      if (response.ok) {
        const result = await response.text();
        console.log('Registration result:', result);
        
        setMessage('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({ ...formData, name: '', password: '' });
      } else {
        const errorText = await response.text();
        console.error('Registration error response:', errorText);
        throw new Error(`Registration failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please check your connection and try again.');
      setIsError(true);
    }
  };

  const handleLogin = async () => {
    try {
      // ---------------------------------------------------------
      // REPLACE THIS URL WITH YOUR LOGIN CHECK FLOW HTTP URL
      // ---------------------------------------------------------
      const flowUrl = 'https://931009ff5cfae9318e79fd03a7aec5.02.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/a34bc8b03a144f50a8d7dfaf61ccab6d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=48J-qJvKOzGSXa9fiR_qhNOzzo0txwmSmplPtXbWEWM';

      const payload = {
        EmailID: formData.email.trim(),
        Password: formData.password.trim()
      };

      console.log('Sending login data:', { eventData: JSON.stringify(payload) });

      // IMPORTANT: Send in the format your flow expects (eventData wrapper)
      const response = await fetch(flowUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ eventData: JSON.stringify(payload) })
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const responseText = await response.text();
        console.log('Login raw response:', responseText);
        
        let result = null;
        if (responseText.trim()) {
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.log('Response is not JSON, checking for success');
          }
        }
        
        // Check if user exists - adjust based on your flow's response
        // Your flow should return an array of users if found
        if (result && Array.isArray(result) && result.length > 0 && result[0].contoso_emailid) {
          // Success: Store authentication status and user data
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(result[0]));
          
          // Redirect to home page
          navigate('/');
        } else if (result && result.Response && result.Response.includes('success')) {
          // Alternative: If your flow returns a success message
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify({ EmailID: formData.email }));
          navigate('/');
        } else {
          setMessage("User not found, register to login");
          setIsError(true);
        }
      } else {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        throw new Error(`Login failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage("User not found, register to login");
      setIsError(true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          <p>{isLogin ? 'Welcome back! Please login.' : 'Create an account.'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setMessage(''); }}
          >
            Login
          </button>
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setMessage(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-field">
              <label>Name <span className="required">*</span></label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter your name" 
                required={!isLogin} 
              />
            </div>
          )}

          <div className="form-field">
            <label>Email ID <span className="required">*</span></label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email" 
              required 
            />
          </div>

          <div className="form-field">
            <label>Password <span className="required">*</span></label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Enter password" 
              required 
            />
          </div>

          {message && (
            <div className={`auth-message ${isError ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="auth-submit-btn">
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;