import React, { useEffect, useState } from "react";
import { Database } from "../database.types";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { LogOutButton } from "../components/LogOutButton";
import { User, useSupabaseClient } from "@supabase/auth-helpers-react";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export const getServerSideProps: GetServerSideProps<{
  user: User;
  customers: Customer[];
}> = withPageAuth<Database>({
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
  const supabase = useSupabaseClient<Database>();
  const [customers, setCustomers] = useState(defaultCustomers);

  useEffect(() => {
    const channel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "customers" },
        (payload) => {
          setCustomers((prev) => [payload.new as Customer, ...prev]);
        }
      )
      .subscribe();
    () => channel.unsubscribe();
  }, []);

  return (
    <div>
      {user.email} <LogOutButton />
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default List;
