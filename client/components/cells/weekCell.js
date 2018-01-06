import React from 'react';
import { Link } from 'react-router-dom';

export default function weekCell (text, record) {
  return <Link to={`/weeks/${text}`}>{text}</Link>;
}
