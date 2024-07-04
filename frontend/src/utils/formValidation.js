import { toast } from "react-toastify";

export const validatePhone = async (phone) => {
  if (!phone) return [false, new Error("Phone number is required")];

  const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

  if (!phoneRegex.test(phone))
    return [false, new Error("Invalid phone number")];
  else return [true, null];
};

export const validateEmail = (email) => {
  if (!email) return [false, new Error("Email is required")];

  const emailRegex = email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  if (!emailRegex) return [false, new Error("Invalid email address")];
  else return [true, null];
};

export const validatePassword = (password) => {
  if (!password) return [false, new Error("Password is required")];

  if (typeof password === "string" && password.length < 8)
    return [false, new Error("Password must contain at least 8 characters")];

  // lowercase letter check
  if (!password.match(/^(?=.*[a-z])/)) {
    return [
      false,
      new Error("Password must contain at least 1 lowercase character"),
    ];
  }

  // digit check
  if (!password.match(/^(?=.*[0-9])/)) {
    return [
      false,
      new Error("Password must contain at least 1 numeric character"),
    ];
  }

  // special character check
  if (!password.match(/^(?=.*[!@#$%^&*,?])/)) {
    return [
      false,
      new Error("Password must contain at least 1 special character"),
    ];
  } else return [true, null];
};

export const validateUsername = (username) => {
  if (!username) return [false, new Error("Username is required")];

  if (typeof username === "string" && username.length < 4)
    return [false, new Error("Username must contain at least 4 characters")];

  if (typeof username === "string" && username.length > 25)
    return [false, new Error("Username must contain at most 20 characters")];

  if (typeof username === "string" && !username.match(/^[a-zA-Z0-9_]+$/))
    return [
      false,
      new Error("Username must contain only alphanumeric characters"),
    ];
  else return [true, null];
};
