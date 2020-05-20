import PropTypes from 'prop-types';
import React, {useState} from 'react';
import useInterval from 'react-use/lib/useInterval';

function minutesSinceNow(date) {
  const ms = Date.now() - date;
  return Math.floor(ms / 1000 / 60);
}

export default function Timer(props) {
  const [minutes, setMinutes] = useState(minutesSinceNow(props.date));

  useInterval(() => {
    setMinutes(minutesSinceNow(props.date));
  }, 1000);

  return (
    <>
      Added{' '}
      {minutes < 1
        ? 'less than a minute'
        : `${minutes} minute${minutes === 1 ? '' : 's'}`}{' '}
      ago
    </>
  );
}

Timer.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired
};
