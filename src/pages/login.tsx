import React, { useState } from "react";
import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
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
      <FormControl isRequired>
        <FormLabel>Enter your email</FormLabel>
        <Input type="email" name="email" placeholder="you@example.com" />
      </FormControl>
      <Button isLoading={loading} type="submit">
        Sign in
      </Button>
    </form>
  );
}
