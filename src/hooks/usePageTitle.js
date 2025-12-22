import { useEffect } from 'react';

/**
 * Custom hook to update the page title
 * @param {string} title - The title to set for the page
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} - Smart Stitch` : 'Smart Stitch';
    
    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default usePageTitle;
