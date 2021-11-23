import React, { useState } from "react";

export default function QuestionForm(props) {
  const { sdk, currentChannel, renderQuestionForm, message, messageText } =
    props;
  const [value, setValue] = useState(messageText);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userMessageParams = new sdk.UserMessageParams();
    var jsonMessageData = {
      type: "VOTING_APP",
      title: `${value}`,
      description: "Need options on where to get good food",
    };
    var jsonString = JSON.stringify(jsonMessageData);
    userMessageParams.data = jsonString;
    userMessageParams.customType = "VOTING_APP";
    userMessageParams.message = value;

    currentChannel.updateUserMessage(
      message.messageId,
      userMessageParams,
      function (userMessage, error) {
        if (error) {
          console.log("sendUserMessage error", error);
        }
        console.log("userMsgParams=", userMessageParams);
        return userMessageParams;
      }
    );

    var channelParams = new sdk.GroupChannelParams();
    var messageId = message.messageId;
    var newChannelData = {};
    newChannelData[`${messageId}`] = {
      voting_app_options: [],
    };
    var newChannelDataString = JSON.stringify(newChannelData);
    channelParams.data = newChannelDataString;
    currentChannel.updateChannel(channelParams, (err, channel) => {
      var parsedChannelData = JSON.parse(channelParams.data);
      console.log("updatedChannelParamsData new=", parsedChannelData);
    });
  };
console.log(currentChannel)

  const handleChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="question">Suggestion</label>
        <br></br>
        <input
          type="text"
          id="question"
          name="question"
          value={value}
          onChange={handleChange}
        />
        <br></br>
        <input type="submit" value="Submit" />
        <button onClick={renderQuestionForm}>Cancel</button>
      </form>
    </div>
  );
}
