import React, { StrictMode } from "react";
import AppList from "./components/AppList";

export default async function Home() {

  return (
    <StrictMode>
      <AppList />
    </StrictMode>
  );
  // return (
  //   <AppList />
  // );
}
