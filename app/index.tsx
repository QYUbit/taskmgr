import { Href, Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  const today = new Date().toISOString().split('T')[0];
  return <Redirect href={`/day/${today}` as Href} />;
}
