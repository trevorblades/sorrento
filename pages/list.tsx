import React, { useEffect, useRef, useState } from "react";
import { Button } from "@chakra-ui/react";
import { Database } from "../database.types";
import { InferGetServerSidePropsType, NextPage } from "next";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";

export const getServerSideProps = withPageAuth<Database>({
  redirectTo: "/login",
  async getServerSideProps(_, supabase) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });
    return {
      props: {
        customers: data,
      },
    };
  },
});

const List: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, customers: defaultCustomers }) => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = useSupabaseClient();

  const [customers, setCustomers] = useState(defaultCustomers);

  useEffect(() => {
    const channel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "customers" },
        (payload) => {
          setCustomers((prev: any) => [payload.new, ...prev]);
        }
      )
      .subscribe();
    console.log(channel);
  }, []);

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
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default List;
