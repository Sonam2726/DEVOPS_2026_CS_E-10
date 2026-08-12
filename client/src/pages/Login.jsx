import { Link } from "react-router-dom";
import Button from "../components/Button";

function Login() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-12">

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden bg-gradient-to-br from-indigo-600 to-violet-600 p-10 text-white md:block">

          <div className="flex h-full flex-col justify-center">

            <h1 className="text-4xl font-bold">
              Welcome Back!
            </h1>

            <p className="mt-4 text-indigo-100">
              Continue your learning journey with SkillBridge AI.
            </p>

            <div className="mt-8 space-y-4">

              <p>✓ Find people with complementary skills</p>
              <p>✓ Learn directly from peers</p>
              <p>✓ Share the skills you know</p>
              <p>✓ Build meaningful learning connections</p>

            </div>

          </div>

        </div>

        {/* Right Side */}
        <div className="p-8 sm:p-10">

          <div className="mx-auto max-w-md">

            <h2 className="text-3xl font-bold text-slate-900">
              Login
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Please enter your details.
            </p>

            <form className="mt-8 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex items-center justify-between text-sm">

                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </button>

              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>

            </form>

            <p className="mt-6 text-center text-sm text-slate-500">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create account
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;