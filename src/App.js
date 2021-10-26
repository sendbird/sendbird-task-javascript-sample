import "./App.css";
import React from "react";
import { SendBirdProvider } from "sendbird-uikit";
import "sendbird-uikit/dist/index.css";
import GroupChannel from "./GroupChannel";

export default function App() {
  const APP_ID = process.env.REACT_APP_APP_ID;
  const USER_ID = process.env.REACT_APP_USER_ID;
  const NICKNAME = process.env.REACT_APP_NICKNAME;
  const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;

  return (
    <div className="App">
      <SendBirdProvider
        appId={APP_ID}
        userId={USER_ID}
        nickname={NICKNAME}
        accessToken={ACCESS_TOKEN}
      >
        <GroupChannel userId={USER_ID} />
      </SendBirdProvider>
    </div>
  );
}