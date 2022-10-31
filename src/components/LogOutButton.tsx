import React, { useState } from "react";
import { Button } from "@chakra-ui/react";
import { Database } from "../database.types";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export function LogOutButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = useSupabaseClient<Database>();

  return (
    <Button
      isLoading={loading}
      onClick={async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (!error) {
          router.push("/login");
        }

        setLoading(false);
      }}
    >
      log out
    </Button>
  );
}
