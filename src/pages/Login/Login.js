import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './Login.css';
import assets from '../../assets/assets';
import { login, signUp } from '../../config/firebase';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [currState, setCurrState] = useState('Sign up');

  const onSubmitHandler = async (data) => {
    const { username, email, password } = data;
    
    if (currState === 'Sign up') {
      await signUp(username, email, password);
    } else {
      await login(email, password);
    }
  };

  return (
    <div className='login'>
      <img src={assets.logo_big} alt='logo' className='logo' />
      <form onSubmit={handleSubmit(onSubmitHandler)} className='login-form'>
        <h2>{currState}</h2>

        {currState === 'Sign up' && (
          <input
            {...register('username', { required: true })}
            type='text'
            placeholder='Username'
            className='form-input'
          />
        )}
        {errors.username && currState === 'Sign up' && <span>Username is required</span>}

        <input
          {...register('email', { required: true, pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/ })}
          type='email'
          placeholder='Email address'
          className='form-input'
        />
        {errors.email && <span>Valid email is required</span>}

        <input
          {...register('password', { required: true, minLength: 6 })}
          type='password'
          placeholder='Password'
          className='form-input'
        />
        {errors.password && <span>Password must be at least 6 characters long</span>}

        <button type='submit' className='btn'>
          {currState === 'Sign up' ? 'Create account' : 'Login now'}
        </button>

        <div className='login-term'>
          <input type='checkbox' {...register('terms', { required: true })} />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        {errors.terms && <span>You must agree to the terms</span>}

        <div className='login-forgot'>
          {currState === 'Sign up' ? (
            <p className='login-toggle'>
              Already have an account?{' '}
              <span onClick={() => setCurrState('Login')}>Click here</span>
            </p>
          ) : (
            <p className='login-toggle'>
              Create an account?{' '}
              <span onClick={() => setCurrState('Sign up')}>Click here</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
