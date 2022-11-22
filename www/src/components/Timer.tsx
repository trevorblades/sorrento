import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useInterval } from "@chakra-ui/react";

type TimerProps = {
  date: Date;
};

export function Timer({ date }: TimerProps) {
  const [time, setTime] = useState(formatDistanceToNow(date));
  useInterval(() => setTime(formatDistanceToNow(date)), 1000);
  return <>Added {time} ago</>;
}
