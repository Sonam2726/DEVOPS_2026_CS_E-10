function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const baseStyles =
    "rounded-lg px-5 py-2.5 text-sm font-semibold transition";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700",

    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",

    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;