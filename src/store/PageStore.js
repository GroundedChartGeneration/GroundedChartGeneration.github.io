import { create } from 'zustand';

const usePageStore = create((set) => ({
  pageIndicator: "Home", // Default page is "Home"
  pages: ["Home", "Chart Gallery", "Chart Comparison"],
  // Home: Pipeline Image, Abstract, Sucessful Cases, Dataset Download Links
  // Image Information: Show All Data, with Metadata and Statistics
  // Image Comparison: Comparison Condition Selector, Image Display (Image_Compared) 
  
  // Action to set the page indicator
  setPageIndicator: (page) => set({ pageIndicator: page }),
}));

export default usePageStore; 