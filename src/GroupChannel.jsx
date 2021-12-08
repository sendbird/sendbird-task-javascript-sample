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
import AddSuggestedTask from "./MessageItems/AddSuggestedTask";

function GroupChannel({ sdk, userId, updateLastMessage }) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const currentChannelUrl = currentChannel ? currentChannel.url : "";
  const [messageText, changeMessageText] = useState("");
  const [showForm, setShowForm] = useState(false);

  var channelChatDiv = document.getElementsByClassName("channel-chat")[0];

  const renderSettingsBar = () => {
    channelChatDiv.style.width = "52%";
    channelChatDiv.style.cssFloat = "left";
  };

  const hideSettingsBar = () => {
    channelChatDiv.style.width = "76%";
    channelChatDiv.style.cssFloat = "right";
  };

  const handleSendUserMessage = (text) => {
    const userMessageParams = new sdk.UserMessageParams();
    var inputText = text;
    if (text.startsWith("/task")) {
      setShowForm(true);

      // updateChannelParams();
      var inputText = text.slice(5)
        console.log('inputText',inputText)
    
      var jsonMessageData = {
        type: "VOTING_APP",
        version: 1,
        title: `${inputText}`,
      };
      var jsonString = JSON.stringify(jsonMessageData);
      userMessageParams.data = jsonString;
      userMessageParams.customType = "VOTING_APP";
    }
    userMessageParams.message = inputText;
    return userMessageParams;
  };


  return (
    <div className="channel-wrap">
      {/* {showForm && (
        <AddSuggestedTask
          messageText={messageText}
          changeMessageText={changeMessageText}
          changeSuggestionSubmit={suggestionSubmit}
          setShowForm={setShowForm}
        />
      )} */}
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
          onBeforeSendUserMessage={handleSendUserMessage}
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
