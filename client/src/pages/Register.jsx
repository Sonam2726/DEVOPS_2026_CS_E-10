import { Link } from "react-router-dom";
import Button from "../components/Button";

function Register() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 px-6 py-12">

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden bg-gradient-to-br from-indigo-600 to-violet-600 p-10 text-white md:block">

          <div className="flex h-full flex-col justify-center">

            <h1 className="text-4xl font-bold">
              Join SkillBridge
            </h1>

            <p className="mt-4 text-indigo-100">
              Connect with people who can teach what you want to
              learn and learn from what you already know.
            </p>

            <div className="mt-8 space-y-4">

              <p>✓ Share the skills you already know</p>
              <p>✓ Discover skills you want to learn</p>
              <p>✓ Connect with compatible learners</p>
              <p>✓ Grow through peer-to-peer learning</p>

            </div>

          </div>

        </div>

        {/* Right Side */}
        <div className="p-8 sm:p-10">

          <div className="mx-auto max-w-md">

            <h2 className="text-3xl font-bold text-slate-900">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create your SkillBridge account to get started.
            </p>

            <form className="mt-8 space-y-5">

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Skills I Can Teach
                </label>

                <input
                  type="text"
                  placeholder="e.g. React, Python, SQL"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Skills I Want to Learn
                </label>

                <input
                  type="text"
                  placeholder="e.g. AWS, Machine Learning"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
              >
                Create Account
              </Button>

            </form>

            <p className="mt-6 text-center text-sm text-slate-500">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;