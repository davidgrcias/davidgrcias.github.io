import React, { createContext } from "react";

export const AppContext = createContext({
  theme: "dark",
  setTheme: () => {},
  showCVModal: false,
  setShowCVModal: () => {},
});
