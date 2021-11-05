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
// import CustomizedMessageItem from "./MessageItems/CustomizedMessageItem";
// import QuestionForm from "./QuestionForm";

function GroupChannel({ sdk, userId }) {
  const [showSettings, setShowSettings] = useState(false);
  // const [showForm, setShowForm] = useState(false);
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

  // const renderQuestionForm = () => {
  //   console.log("in renderQuestionForm");
  //   setShowForm(!showForm);
  // };

  const handleSendUserMessage = (text) => {
    const userMessageParams = new sdk.UserMessageParams();
    var jsonMessageData = {
      key: "VOTING_APP",
      value: {
        title: `${text}`,
        description: "More info on where to get tasty bites",
        options: [],
      },
    };
    var jsonString = JSON.stringify(jsonMessageData);
    userMessageParams.data = jsonString;
    userMessageParams.message = text;
    return userMessageParams;
  };

  if (currentChannel && sdk && sdk.ChannelHandler) {
    var channelHandler = new sdk.ChannelHandler();
    channelHandler.onMessageReceived = (channel, message) => {
      console.log("onMessageReceived", message);
    };

    channelHandler.onMessageUpdated = (channel, message) => {
      console.log("in onMessageUpdated", message);
      var data = JSON.parse(message.data);
      var newOption = {
        title: message.message,
        description: "description inputted",
        voters: [1],
        created_by: message._sender.nickname,
      };
      data.value.options.push(newOption);
      var valueString = JSON.stringify(data);
      const params = new sdk.UserMessageParams();
      params.data = valueString;
      var messageId = message.messageId;
      channel.updateUserMessage(messageId, params, function (message, error) {
        if (error) {
          // Handle error.
        }
        var parsedMsgData = JSON.parse(message.data)
        console.log("updateUserMessage; parsed msg.data=", parsedMsgData);
      });
    };

    sdk.addChannelHandler("abc12334", channelHandler);
  }

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
        {/* <button onClick={renderQuestionForm}>Open/Close Form</button>
        {showForm && (
          <div>
            <QuestionForm />
          </div>
        )} */}
        <Channel
          channelUrl={currentChannelUrl}
          onChatHeaderActionClick={() => {
            setShowSettings(!showSettings);
            renderSettingsBar();
          }}
          onBeforeSendUserMessage={handleSendUserMessage}
          // renderChatItem={({
          //   message,
          //   onDeleteMessage,
          //   onUpdateMessage,
          //   emojiContainer,
          // }) => (
          //   <CustomizedMessageItem
          //     message={message}
          //     onDeleteMessage={onDeleteMessage}
          //     onUpdateMessage={onUpdateMessage}
          //     emojiContainer={emojiContainer}
          //     userId={userId}
          //   />
          // )}
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
