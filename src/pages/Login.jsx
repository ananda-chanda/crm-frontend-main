import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../features/api/usersApiSlice';
import { setCredentials } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Load saved credentials if "Remember Me" was previously checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  // Validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(
      value && !validateEmail(value) ? 'Please enter a valid email address' : ''
    );
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(
      value && value.length < 6 ? 'Password must be at least 6 characters' : ''
    );
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Final validation before submission
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setPasswordError('Please enter your password');
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));

      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-200 via-indigo-200 to-cyan-200 p-6 relative overflow-hidden">
      {/* Decorative glowing blobs */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-indigo-400/30 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1500" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200 p-8 transform transition duration-300">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500 p-3 rounded-full shadow-md">
                <LogIn className="text-white w-6 h-6" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Sign in to CRM
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-4 text-pink-400" />
                <input
                  type="email"
                  placeholder="admin@crm.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full p-3 pl-10 rounded-lg bg-gradient-to-r from-indigo-50 to-cyan-50 border text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                    emailError
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-indigo-400'
                  }`}
                />
              </div>
              {emailError && (
                <p className="flex items-center text-red-500 text-xs mt-1">
                  <AlertCircle size={12} className="mr-1" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-4 text-indigo-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full p-3 pl-10 pr-10 rounded-lg bg-gradient-to-r from-cyan-50 to-pink-50 border text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                    passwordError
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-pink-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <p className="flex items-center text-red-500 text-xs mt-1">
                  <AlertCircle size={12} className="mr-1" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 accent-pink-500"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>
              <button
                type="button"
                className="text-indigo-500 hover:text-indigo-600 hover:underline"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:opacity-95 transition disabled:opacity-60 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;