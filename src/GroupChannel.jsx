import React, { useState } from "react";
import {
  ChannelList,
  Channel,
  ChannelSettings,
  sendBirdSelectors,
  withSendBird,
} from "sendbird-uikit";
import "./index.css";
import "sendbird-uikit/dist/index.css";
import CustomizedMessageItem from "./CustomizedMessageItem";
import CustomizedMessageInput from "./CustomizedMessageInput";

function GroupChannel({ sdk, userId, updateLastMessage }) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const currentChannelUrl = currentChannel ? currentChannel.url : "";

  var channelChatDiv = document.getElementsByClassName("channel-chat")[0];

  const renderSettingsBar = () => {
    channelChatDiv.style.width = "52%";
    channelChatDiv.style.cssFloat = "left";
  };

  const hideSettingsBar = () => {
    channelChatDiv.style.width = "76%";
    channelChatDiv.style.cssFloat = "right";
  };

  return (
    <div className="channel-wrap">
      <div className="channel-list">
        <ChannelList
          onChannelSelect={(channel) => {
            setCurrentChannel(channel);
          }}
        />
      </div>
      <div className="channel-chat">
        <Channel
          channelUrl={currentChannelUrl}
          onChatHeaderActionClick={() => {
            setShowSettings(!showSettings);
            renderSettingsBar();
          }}
          renderChatItem={({
            message,
            onDeleteMessage,
            onUpdateMessage,
            emojiContainer,
          }) => (
            <CustomizedMessageItem
              message={message}
              onDeleteMessage={onDeleteMessage}
              onUpdateMessage={onUpdateMessage}
              emojiContainer={emojiContainer}
              userId={userId}
              sdk={sdk}
              currentChannel={currentChannel}
              updateLastMessage={updateLastMessage}
            />
          )}
          
          renderMessageInput={({ channel, user, disabled }) => (
            <CustomizedMessageInput
              channel={channel}
              user={user}
              disabled={disabled}
            />
          )}

        />
      </div>
      {showSettings && (
        <div className="channel-settings">
          <ChannelSettings
            channelUrl={currentChannelUrl}
            onCloseClick={() => {
              setShowSettings(false);
              hideSettingsBar();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default withSendBird(GroupChannel, (store) => {
  return {
    sdk: sendBirdSelectors.getSdk(store),
    user: store.stores.userStore.user,
    updateLastMessage: sendBirdSelectors.getUpdateUserMessage(store),
  };
});
