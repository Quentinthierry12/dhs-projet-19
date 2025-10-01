
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded-lg text-center">
        <h1 className="text-4xl font-bold text-letc-blue mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page introuvable</p>
        <p className="text-gray-500 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-letc-blue hover:bg-letc-darkblue text-white rounded-md transition-colors"
        >
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
