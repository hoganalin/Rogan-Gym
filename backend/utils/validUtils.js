const isValidString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};
const isInteger = (value) => {
  return typeof value === "number" && Number.isInteger(value);
};
const isValidEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof value === "string" && emailRegex.test(value);
};
const isValidPassword = (value) => {
  // 需要包含英文數字大小寫，最短8個字，最長16個字"

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;
  return typeof value === "string" && passwordRegex.test(value);
};
const isValidMonth = (value) => {
  const monthRegex =
    /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i;
  return typeof value === "string" && monthRegex.test(value);
};
module.exports = {
  isValidString,
  isInteger,
  isValidEmail,
  isValidPassword,
  isValidMonth,
};
