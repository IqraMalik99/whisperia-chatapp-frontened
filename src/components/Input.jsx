import { forwardRef } from "react";

const Input = forwardRef(({ type ="text", className ="", ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      {...props}
      className={`rounded-xl p-3 my-3 h-10 text-black placeholder:text-gray-600 bg-white/50 
      focus:outline-none w-64 transition duration-300 ease-in-out transform focus:scale-105 ${className}`}
    />
  );
});
Input.displayName = "Input";
export default Input;
