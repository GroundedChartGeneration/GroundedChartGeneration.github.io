import { create } from 'zustand';

const usePageStore = create((set) => ({
  pageIndicator: "Home", // Default page is "Home"
  pages: ["Home", "Basic Table", "Image Comparison"],
  // Home: Pipeline Image, Abstract, Sucessful Cases, Dataset Download Links
  // Basic Table: Show All Data, with Metadata and Statistics
  // Image Comparison: Comparison Condition Selector, Image Display (Image_Compared) 
  
  // Action to set the page indicator
  setPageIndicator: (page) => set({ pageIndicator: page }),
}));

export default usePageStore; 