import React, { useMemo } from "react";
import AdminMessage from "./AdminMessage";
import FileMessage from "./FileMessage";
import UserMessage from "./UserMessage";
import "./index.css";
import VotingMessage from "./VotingMessage";

export default function CustomizedMessageItem(props) {
  const { message, emojiContainer, onDeleteMessage, onUpdateMessage, userId, sdk, currentChannel } =
    props;

  // console.log("message=", message);
  // var data = message.data ? true : false;
  console.log("msg", message)
  const MessageHOC = useMemo(() => {
  
    // var messageData = JSON.parse(message.data);
//not every msg.data has something so if it's null then make the variable =false
    // var messageData = message.data === null ? false : JSON.parse(message.data);
    // console.log(messageData)

    if (message.isAdminMessage && message.isAdminMessage()) {
      return () => <AdminMessage message={message} />;
    } else if (message.isFileMessage && message.isFileMessage()) {
      return () => (
        <FileMessage
          message={message}
          userId={userId}
          onDeleteMessage={onDeleteMessage}
        />
      );
    }
     else if ( 
      message.customType ===  "VOTING_APP"
      // &&
      // messageData.hasOwnProperty("type") &&
      // messageData["type"] === "VOTING_APP"
    ) {
      return () => (
      <VotingMessage
        message={message}
        userId={userId}
        emojiContainer={emojiContainer}
        onDeleteMessage={onDeleteMessage}
        onUpdateMessage={onUpdateMessage}
        sdk={sdk}
        currentChannel={currentChannel}
      />
      )
    }
    
    else if (message.isUserMessage && message.isUserMessage()) {
      return () => (
        <UserMessage
          message={message}
          userId={userId}
          emojiContainer={emojiContainer}
          onDeleteMessage={onDeleteMessage}
          onUpdateMessage={onUpdateMessage}
          sdk={sdk}
          currentChannel={currentChannel}
        />
      );
    }
    return () => <div />;
  }, [message, emojiContainer, userId, onDeleteMessage, onUpdateMessage, sdk, currentChannel]);

  return (
    <div id={message.messageId} className="customized-message-item">
      <MessageHOC />
      <br />
    </div>
  );
}
