import React, { useState } from "react";
import { sendBirdSelectors, withSendBird } from "sendbird-uikit";
import {
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@material-ui/core";
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import AddSuggestedTask from "./MessageItems/AddSuggestedTask";

const useStyles = makeStyles({
  input: {
    display: "none",
  },
});

function CustomizedMessageInput(props) {
  const classes = useStyles();

  // props
  const { channel, disabled, sendUserMessage, sendFileMessage, sdk } = props;

  const [inputText, setInputText] = useState("");
  const [formText, setFormText] = useState("");
  const [showTaskForm, setShowTaskForm] = useState("");
  const isInputEmpty = inputText.length < 1;

  const handleChange = (event) => {
    if (event?.target?.value?.startsWith(`/task `)) {
      setShowTaskForm(true);
    }
    setInputText(event.target.value);
  };

  const sendFileMessage_ = (event) => {
    if (event.target.files && event.target.files[0]) {
      console.log(event.target.files[0]);

      // Implement your custom validation here
      if (event.target.files[0].size > 1 * 1000 * 1000) {
        alert("Image size greater than 1 MB");
        return;
      }

      const params = new sdk.FileMessageParams();
      params.file = event.target.files[0];

      sendFileMessage(channel.url, params)
        .then((message) => {
          console.log(message);
          event.target.value = "";
        })
        .catch((error) => {
          console.log(error.stack);
        });
    }
  };

  const checkSendUserMessage_ = (event) => {
    if (showTaskForm) {
      changeSuggestionSubmit(event);
    } else {
      const params = new sdk.UserMessageParams();
      params.message = inputText;
      sendUserMessage(channel.url, params)
        .then((message) => {
          console.log(message);
          setInputText("");
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  };

  const changeSuggestionSubmit = (event) => {
    event.preventDefault();
    const userMessageParams = new sdk.UserMessageParams();
    var jsonMessageData = {
      type: "VOTING_APP",
      version: 1,
      title: `${formText}`,
    };
    var jsonString = JSON.stringify(jsonMessageData);
    userMessageParams.data = jsonString;
    userMessageParams.customType = "VOTING_APP";
    userMessageParams.message = formText;
    sendUserMessage(channel.url, userMessageParams)
      .then((message) => {
        console.log(message);
        setInputText("");
      })
      .catch((error) => {
        console.log(error.message);
      });
    setShowTaskForm(false);
    setFormText("");
  };

  return (
    <div className="customized-message-input">
      {showTaskForm && (
        <AddSuggestedTask
          messageText={formText}
          changeMessageText={setFormText}
          changeSuggestionSubmit={changeSuggestionSubmit}
          setShowForm={setShowTaskForm}
          onClose={() => {
            setShowTaskForm(false);
          }}
        />
      )}
      <FormControl variant="outlined" disabled={disabled} fullWidth>
        <InputLabel htmlFor="customized-message-input">User Message</InputLabel>
        <OutlinedInput
          id="customized-message-input"
          type="txt"
          value={inputText}
          onChange={handleChange}
          onKeyPress={(event) => {
            if (event.code === "Enter") {
              checkSendUserMessage_();
            }
          }}
          labelWidth={105}
          endAdornment={
            <InputAdornment position="end">
              {isInputEmpty ? (
                <div className="customized-message-input__file-container">
                  <input
                    accept="image/*"
                    id="icon-button-file"
                    type="file"
                    className={classes.input}
                    onChange={sendFileMessage_}
                  />
                  <label htmlFor="icon-button-file">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      disabled={disabled}
                    >
                      <AttachFileIcon
                        color={disabled ? "disabled" : "primary"}
                      />
                    </IconButton>
                  </label>
                </div>
              ) : (
                <IconButton disabled={disabled} onClick={checkSendUserMessage_}>
                  <SendIcon color={disabled ? "disabled" : "primary"} />
                </IconButton>
              )}
            </InputAdornment>
          }
        />
      </FormControl>
    </div>
  );
}

const mapStoreToProps = (store) => {
  const sendUserMessage = sendBirdSelectors.getSendUserMessage(store);
  const sdk = sendBirdSelectors.getSdk(store);
  const sendFileMessage = sendBirdSelectors.getSendFileMessage(store);
  return {
    sendUserMessage,
    sdk,
    sendFileMessage,
  };
};

export default withSendBird(CustomizedMessageInput, mapStoreToProps);
