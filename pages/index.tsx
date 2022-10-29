import Link from "next/link";
import React from "react";

export default function HomePage() {
  return (
    <div>
      welcome to sorrento <Link href="/list">to the list</Link>
    </div>
  );
}
