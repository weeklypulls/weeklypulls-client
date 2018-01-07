import React from 'react';
import { Link } from 'react-router-dom';

export default function pullLinkCell (text, record) {
  return <Link to={`/pulls/${record.pull_id}`}>{text}</Link>;
}
