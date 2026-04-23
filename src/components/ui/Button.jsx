import { motion } from 'framer-motion';

export const Button = ({ children, className = '', variant = 'primary', ...props }) => {
  const styles = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white",
    secondary: "bg-white border text-gray-700 hover:bg-gray-50",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "hover:bg-gray-100 text-gray-600"
  };
  return (
    <motion.button whileTap={{ scale: 0.97 }} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${styles[variant]} ${className}`} {...props}>
      {children}
    </motion.button>
  );
};