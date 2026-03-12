import React from 'react'
import { SignInButton } from "@clerk/clerk-react";
import { SparklesIcon } from "lucide-react";

function loginSignupopUp() {
    return (
        <div>
            <SignInButton mode="modal">
                <button className="btn btn-primary">
                    <SparklesIcon className="size-4" />
                    Start Selling
                </button>
            </SignInButton>
        </div>
    )
}

export default loginSignupopUp;
