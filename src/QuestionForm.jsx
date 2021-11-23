import React, { useState } from "react";

export default function QuestionForm(props) {
  const { sdk, currentChannel,renderQuestionForm } = props;
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    console.log("value", value);
    //e.preventDefault();
    //on submit,have it sent as a message type (so it has the message data fields)

    //on add of option -> have them render to screen
    //when option is added (have question hold the meta array key w/ this option)
    //once an option is added, have the value hold a meta array with the option as a key
    const userMessageParams = new sdk.UserMessageParams();
    var jsonMessageData = {
      type: "VOTING_APP",
      title: `${value}`,
      description: "Need options on where to get good food",
    };
    var jsonString = JSON.stringify(jsonMessageData);
    userMessageParams.data = jsonString;
    userMessageParams.customType="VOTING_APP";
    userMessageParams.message = value;

    currentChannel.sendUserMessage(
      userMessageParams,
      function (userMessage, error) {
        if (error) {
          console.log("sendUserMessage error", error);
        }
        console.log("userMsgParams=", userMessageParams);
        return userMessageParams;
      }
    );
  };

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
