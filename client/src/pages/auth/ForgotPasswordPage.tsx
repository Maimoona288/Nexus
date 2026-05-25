// // import React, { useState } from 'react';
// // import { Link } from 'react-router-dom';
// // import { Mail, ArrowLeft } from 'lucide-react';
// // import { useAuth } from '../../context/AuthContext';
// // import { Button } from '../../components/ui/Button';
// // import { Input } from '../../components/ui/Input';

// // export const ForgotPasswordPage: React.FC = () => {
// //   const [email, setEmail] = useState('');
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isSubmitted, setIsSubmitted] = useState(false);
  
// //   const { forgotPassword } = useAuth();
  
// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setIsLoading(true);
    
// //     try {
// //       await forgotPassword(email);
// //       setIsSubmitted(true);
// //     } catch (error) {
// //       // Error is handled by the AuthContext
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };
  
// //   if (isSubmitted) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
// //         <div className="sm:mx-auto sm:w-full sm:max-w-md">
// //           <div className="text-center">
// //             <Mail className="mx-auto h-12 w-12 text-primary-600" />
// //             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
// //               Check your email
// //             </h2>
// //             <p className="mt-2 text-sm text-gray-600">
// //               We've sent password reset instructions to {email}
// //             </p>
// //           </div>
          
// //           <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
// //             <div className="space-y-4">
// //               <p className="text-sm text-gray-500">
// //                 Didn't receive the email? Check your spam folder or try again.
// //               </p>
              
// //               <Button
// //                 variant="outline"
// //                 fullWidth
// //                 onClick={() => setIsSubmitted(false)}
// //               >
// //                 Try again
// //               </Button>
              
// //               <Link to="/login">
// //                 <Button
// //                   variant="ghost"
// //                   fullWidth
// //                   leftIcon={<ArrowLeft size={18} />}
// //                 >
// //                   Back to login
// //                 </Button>
// //               </Link>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }
  
// //   return (
// //     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
// //       <div className="sm:mx-auto sm:w-full sm:max-w-md">
// //         <div className="text-center">
// //           <Mail className="mx-auto h-12 w-12 text-primary-600" />
// //           <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
// //             Forgot your password?
// //           </h2>
// //           <p className="mt-2 text-sm text-gray-600">
// //             Enter your email address and we'll send you instructions to reset your password.
// //           </p>
// //         </div>
        
// //         <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
// //           <form className="space-y-6" onSubmit={handleSubmit}>
// //             <Input
// //               label="Email address"
// //               type="email"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               required
// //               fullWidth
// //               startAdornment={<Mail size={18} />}
// //             />
            
// //             <Button
// //               type="submit"
// //               fullWidth
// //               isLoading={isLoading}
// //             >
// //               Send reset instructions
// //             </Button>
            
// //             <Link to="/login">
// //               <Button
// //                 variant="ghost"
// //                 fullWidth
// //                 leftIcon={<ArrowLeft size={18} />}
// //               >
// //                 Back to login
// //               </Button>
// //             </Link>
// //           </form>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { Button } from '../../components/ui/Button';
// import { Input } from '../../components/ui/Input';

// export const ForgotPasswordPage: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [error, setError] = useState<string | null>(null); // Added local error state
  
//   const { forgotPassword } = useAuth();
  
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null); // Clear previous errors on retry
    
//     try {
//       await forgotPassword(email);
//       setIsSubmitted(true);
//     } catch (err: any) {
//       // Capture the explicit reason your backend rejected the request
//       setError(err.response?.data?.message || err.message || 'Something went wrong.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   if (isSubmitted) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="text-center">
//             <Mail className="mx-auto h-12 w-12 text-primary-600" />
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//               Check your email
//             </h2>
//             <p className="mt-2 text-sm text-gray-600">
//               We've sent password reset instructions to <span className="font-semibold">{email}</span>
//             </p>
//           </div>
          
//           <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//             <div className="space-y-4">
//               <p className="text-sm text-gray-500">
//                 Didn't receive the email? Check your spam folder or try again.
//               </p>
              
//               <Button
//                 variant="outline"
//                 fullWidth
//                 onClick={() => setIsSubmitted(false)}
//               >
//                 Try again
//               </Button>
              
//               <Link to="/login" className="block">
//                 <Button
//                   variant="ghost"
//                   fullWidth
//                   leftIcon={<ArrowLeft size={18} />}
//                 >
//                   Back to login
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="text-center">
//           <Mail className="mx-auto h-12 w-12 text-primary-600" />
//           <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//             Forgot your password?
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Enter your email address and we'll send you instructions to reset your password.
//           </p>
//         </div>
        
//         <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//           {/* Display local errors prominently above inputs */}
//           {error && (
//             <div className="mb-4 bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-md flex items-start text-sm">
//               <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
//               <span>{error}</span>
//             </div>
//           )}

//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <Input
//               label="Email address"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               fullWidth
//               startAdornment={<Mail size={18} />}
//               placeholder="you@example.com"
//             />
            
//             <Button
//               type="submit"
//               fullWidth
//               isLoading={isLoading}
//             >
//               Send reset instructions
//             </Button>
            
//             <Link to="/login" className="block">
//               <Button
//                 variant="ghost"
//                 fullWidth
//                 leftIcon={<ArrowLeft size={18} />}
//               >
//                 Back to login
//               </Button>
//             </Link>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Mail, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { Button } from '../../components/ui/Button';
// import { Input } from '../../components/ui/Input';
// import axios from 'axios';

// export const ForgotPasswordPage: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [devUrl, setDevUrl] = useState<string | null>(null); // Track bypass link locally
  
//   const { forgotPassword } = useAuth();
  
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     setDevUrl(null);
    
//     try {
//       // 1. Still call AuthContext to preserve state engine changes
//       await forgotPassword(email);
      
//       // 2. Directly make a rapid call to get response data payloads for testing shortcuts
//       const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
//       if (response.data && response.data.developmentUrl) {
//         setDevUrl(response.data.developmentUrl);
//       }
      
//       setIsSubmitted(true);
//     } catch (err: any) {
//       setError(err.response?.data?.message || err.message || 'Something went wrong.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   if (isSubmitted) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="text-center">
//             <Mail className="mx-auto h-12 w-12 text-primary-600" />
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//               Check your email
//             </h2>
//             <p className="mt-2 text-sm text-gray-600">
//               We've sent password reset instructions to <span className="font-semibold">{email}</span>
//             </p>
//           </div>
          
//           <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//             <div className="space-y-4">
              
//               {/* 🛠️ CLICKABLE DEV BYPASS LINK SHORTCUT */}
//               {devUrl && (
//                 <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md text-left">
//                   <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block mb-1">
//                     🛠️ Local Environment Link Shortcut:
//                   </span>
//                   <p className="text-xs text-gray-600 mb-2">
//                     Because live mail delivery isn't configured yet, click the link below to go straight to your password update page:
//                   </p>
//                   <a 
//                     href={devUrl}
//                     className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700 underline break-all"
//                   >
//                     Go to Reset Password Screen <ExternalLink size={12} className="ml-1" />
//                   </a>
//                 </div>
//               )}

//               <p className="text-sm text-gray-500 pt-2">
//                 Didn't receive the email? Check your spam folder or try again.
//               </p>
              
//               <Button
//                 variant="outline"
//                 fullWidth
//                 onClick={() => setIsSubmitted(false)}
//               >
//                 Try again
//               </Button>
              
//               <Link to="/login" className="block">
//                 <Button
//                   variant="ghost"
//                   fullWidth
//                   leftIcon={<ArrowLeft size={18} />}
//                 >
//                   Back to login
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="text-center">
//           <Mail className="mx-auto h-12 w-12 text-primary-600" />
//           <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//             Forgot your password?
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Enter your email address and we'll send you instructions to reset your password.
//           </p>
//         </div>
        
//         <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//           {error && (
//             <div className="mb-4 bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-md flex items-start text-sm">
//               <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
//               <span>{error}</span>
//             </div>
//           )}

//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <Input
//               label="Email address"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               fullWidth
//               startAdornment={<Mail size={18} />}
//               placeholder="you@example.com"
//             />
            
//             <Button
//               type="submit"
//               fullWidth
//               isLoading={isLoading}
//             >
//               Send reset instructions
//             </Button>
            
//             <Link to="/login" className="block">
//               <Button
//                 variant="ghost"
//                 fullWidth
//                 leftIcon={<ArrowLeft size={18} />}
//               >
//                 Back to login
//               </Button>
//             </Link>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { forgotPassword } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Calls your newly updated live mail delivery backend route seamlessly via context
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-primary-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent password reset instructions to <span className="font-semibold">{email}</span>
            </p>
          </div>
          
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsSubmitted(false)}
              >
                Try again
              </Button>
              
              <Link to="/login" className="block">
                <Button
                  variant="ghost"
                  fullWidth
                  leftIcon={<ArrowLeft size={18} />}
                >
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded-md flex items-start text-sm">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              startAdornment={<Mail size={18} />}
              placeholder="you@example.com"
            />
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Send reset instructions
            </Button>
            
            <Link to="/login" className="block">
              <Button
                variant="ghost"
                fullWidth
                leftIcon={<ArrowLeft size={18} />}
              >
                Back to login
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};