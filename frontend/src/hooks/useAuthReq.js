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
      try {
        if (isSignedInRef.current) {
          // Add a timeout fallback for getToken to prevent hanging on mobile/slow connections
          const tokenPromise = getTokenRef.current();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Auth token timeout")), 10000)
          );
          
          const token = await Promise.race([tokenPromise, timeoutPromise]);
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (err) {
        console.error("Auth interceptor error:", err);
        // Continue without token if it fails/times out, server will handle unauthorized
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