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
import CustomizedMessageItem from "./MessageItems/CustomizedMessageItem";

function GroupChannel({ sdk, userId }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

  const renderQuestionForm = () => {
    setShowForm(!showForm);
  };

  // if (currentChannel && sdk && sdk.ChannelHandler) {
  //   var channelHandler = new sdk.ChannelHandler();
  //   channelHandler.onMessageReceived = (channel, message) => {
  //     console.log("onMessageReceived", message);
  //     var channelParams = new sdk.GroupChannelParams();
  //     var messageId = message.messageId;
  //     var newChannelData = {};
  //     newChannelData[`${messageId}`] = {
  //       voting_app_options: [],
  //     };
  //     var newChannelDataString = JSON.stringify(newChannelData);
  //     channelParams.data = newChannelDataString;
  //     channel.updateChannel(channelParams, (err, channel) => {
  //       var parsedChannelData = JSON.parse(channelParams.data);
  //       console.log("updatedChannelParamsData new=", parsedChannelData);
  //     });
  //   };

  //   channelHandler.onMessageUpdated = (channel, message) => {
  //     var messageData = JSON.parse(message.data);
  //     var messageId = message.messageId;
  //     var newOption = {
  //       title: message.message,
  //       voters: [messageId],
  //       created_by: message._sender.nickname,
  //     };
  //     var channelParams = new sdk.GroupChannelParams();
  //     if (
  //       messageData.hasOwnProperty("type") &&
  //       messageData["type"] === "VOTING_APP"
  //     ) {
  //       var parsedChannelData = JSON.parse(channel.data);
  //       if (parsedChannelData.hasOwnProperty(`${messageId}`)) {
  //         parsedChannelData[`${messageId}`].voting_app_options.push(newOption);
  //         var channelDataString = JSON.stringify(parsedChannelData);
  //         channelParams.data = channelDataString;
  //         channel.updateChannel(channelParams, (err, channel) => {
  //           var parsedChannelData = JSON.parse(channelParams.data);
  //           console.log("updatedChannelParamsData set=", parsedChannelData);
  //         });
  //       }
  //     }
  //   };

  //   sdk.addChannelHandler("abc12334", channelHandler);
  // }

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
        <button onClick={renderQuestionForm}>Suggest Task</button>
        <Channel
          channelUrl={currentChannelUrl}
          onChatHeaderActionClick={() => {
            setShowSettings(!showSettings);
            renderSettingsBar();
          }}
          // onBeforeSendUserMessage={handleSendUserMessage}
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
  };
});
