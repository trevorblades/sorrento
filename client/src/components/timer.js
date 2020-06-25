import PropTypes from 'prop-types';
import React, {useState} from 'react';
import useInterval from 'react-use/lib/useInterval';
import {formatDistanceToNow} from 'date-fns';

export default function Timer(props) {
  const [distance, setDistance] = useState(formatDistanceToNow(props.date));
  useInterval(() => setDistance(formatDistanceToNow(props.date)), 1000);
  return <>Added {distance} ago</>;
}

Timer.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired
};
