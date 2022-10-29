import React, { useState } from "react";
import { Button } from "@chakra-ui/react";
import { InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";

export const getServerSideProps = withPageAuth({ redirectTo: "/login" });

const List: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user }) => {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {user.email}{" "}
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
    </div>
  );
};

export default List;
