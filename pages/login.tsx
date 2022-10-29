import React, { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = useSupabaseClient();

  if (emailSent) {
    return <div>email sent</div>;
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        const { email } = event.target as typeof event.target & {
          email: { value: string };
        };

        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
          email: email.value,
        });

        if (!error) {
          setEmailSent(true);
        }

        setLoading(false);
      }}
    >
      <input type="email" name="email" required />
      <button disabled={loading} type="submit">
        login
      </button>
    </form>
  );
}
