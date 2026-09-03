import React from "react";
import { cn } from "../../lib/cn";

/**
 * Floating-label text input (label sits on the border, floats up on
 * focus/fill). Login and Signup each hand-rolled this same
 * peer-placeholder-shown pattern per field — now it's one component.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} [props.type="text"]
 */
const FloatingInput = ({ id, label, type = "text", className = "", ...rest }) => (
  <div className={cn("relative", className)}>
    <input
      id={id}
      name={id}
      type={type}
      placeholder=" "
      className="peer w-full bg-transparent border-0 border-b-2 border-gray-300 px-4 py-3 text-gray-900 placeholder-transparent focus:border-[var(--jb-primary)] focus:outline-none transition-all duration-300"
      {...rest}
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-3 text-gray-500 text-base transition-all duration-300
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
      peer-focus:-top-2 peer-focus:text-sm peer-focus:text-[var(--jb-primary)]
      peer-[&:not(:placeholder-shown)]:-top-2
      peer-[&:not(:placeholder-shown)]:text-sm
      peer-[&:not(:placeholder-shown)]:text-[var(--jb-primary)]"
    >
      {label}
    </label>
  </div>
);

export default FloatingInput;
