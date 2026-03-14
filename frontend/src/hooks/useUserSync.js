import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { syncUser } from "../lib/api";

// the best way to implement this is by using webhooks
function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  // console.log("User data from Clerk:", user);

  const { mutate: syncUserMutation, isPending, isSuccess, isError } = useMutation({ mutationFn: syncUser });
  // console.log("useUserSync status:", { isPending, isSuccess, isError });

  useEffect(() => {
    if (isSignedIn && user && !isPending && !isSuccess && !isError) {
      syncUserMutation({
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName,
        imageUrl: user.imageUrl,
      });
    }
  }, [isSignedIn, user, syncUserMutation, isPending, isSuccess, isError]);


  return { isSynced: isSuccess };
}

export default useUserSync;