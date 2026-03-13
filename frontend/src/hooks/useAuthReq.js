import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import api from "../lib/axios";

function useAuthReq() {
  const { isSignedIn, getToken, isLoaded } = useAuth();

  // Store latest values in refs so the interceptor always reads fresh state
  const getTokenRef = useRef(getToken);
  const isSignedInRef = useRef(isSignedIn);

  useEffect(() => {
    getTokenRef.current = getToken;
    isSignedInRef.current = isSignedIn;
  }, [getToken, isSignedIn]);

  // Register the interceptor once; it reads current values via refs
  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      if (isSignedInRef.current) {
        const token = await getTokenRef.current();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  return { isSignedIn, isClerkLoaded: isLoaded };
}

export default useAuthReq;