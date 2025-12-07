import { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Music2, Loader2, AlertCircle } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const { login, register, loading, error } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    let res;
    if (isLogin) {
      res = await login(form.email, form.password);
    } else {
      res = await register(form.name, form.email, form.password);
    }
    if (res?.success) {
      navigate("/");
    }
  };

  // const handleKeyPress = (e) => {
  //   if (e.key === "Enter" && !loading) {
  //     handleSubmit();
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-300 to-base-200 p-4">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        
        

        {/* Card */}
        <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-2xl border border-base-300 p-5 sm:p-6 lg:p-8">
          
          {/* Header */}
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 sm:mt-2">
              {isLogin ? "Login to continue your journey" : "Join the Musify community"}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3 sm:space-y-4">
            
            {/* Name Input - Only for Register */}
            {!isLogin && (
              <div>
                <label className="label py-1">
                  <span className="label-text text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <User size={14} className="sm:w-4 sm:h-4 text-primary" />
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="input input-sm sm:input-md input-bordered w-full focus:input-primary transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onKeyDown={(e) => {
  if (e.key === "Enter" && !loading) {
    e.preventDefault();   // prevent double submit
    handleSubmit();
  }
}}

                />
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="label py-1">
                <span className="label-text text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <Mail size={14} className="sm:w-4 sm:h-4 text-primary" />
                  Email
                </span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-sm sm:input-md input-bordered w-full focus:input-primary transition-all"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) => {
  if (e.key === "Enter" && !loading) {
    e.preventDefault();   // prevent double submit
    handleSubmit();
  }
}}

              />
            </div>

            {/* Password Input */}
            <div>
              <label className="label py-1">
                <span className="label-text text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <Lock size={14} className="sm:w-4 sm:h-4 text-primary" />
                  Password
                </span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-sm sm:input-md input-bordered w-full focus:input-primary transition-all"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => {
  if (e.key === "Enter" && !loading) {
    e.preventDefault();   // prevent double submit
    handleSubmit();
  }
}}

              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error shadow-lg py-2 sm:py-3">
                <AlertCircle size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              className={`btn btn-sm sm:btn-md bg-gradient-to-r from-primary to-secondary border-none text-white font-bold w-full shadow-lg hover:shadow-xl hover:scale-105 transition-all mt-4 sm:mt-6 ${
                loading ? "loading" : ""
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="text-xs sm:text-sm">{isLogin ? "Logging in..." : "Creating account..."}</span>
                </>
              ) : (
                <span className="text-xs sm:text-sm">{isLogin ? "Login" : "Sign Up"}</span>
              )}
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="divider my-4 sm:my-6 text-xs sm:text-sm">OR</div>
          
          <div className="text-center">
            <p className="text-xs sm:text-sm text-base-content/60">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              className="btn btn-link btn-sm sm:btn-md text-primary font-semibold hover:text-secondary transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              <span className="text-xs sm:text-sm">{isLogin ? "Create an account" : "Login here"}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] sm:text-xs text-base-content/40 mt-4 sm:mt-6 px-4">
          By continuing, you agree to Musify's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;