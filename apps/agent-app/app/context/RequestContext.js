import React, { createContext, useContext, useState } from "react";

const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
  const [currentRequest, setCurrentRequest] = useState(null);

  return (
    <RequestContext.Provider
      value={{
        currentRequest,
        setCurrentRequest,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequest = () => useContext(RequestContext);
