import React, { useState } from "react";
import {
  Card,
  CardHeader,
  Avatar,
  CardContent,
  Typography,
  TextField,
} from "@material-ui/core";
import "./index.css";
import QuestionForm from "../QuestionForm";

export default function VotingMessage(props) {
  // props
  const {
    message,
    userId,
    onDeleteMessage,
    onUpdateMessage,
    sdk,
    currentChannel,
  } = props;

  // useState
  const [messageText, changeMessageText] = useState(message.message);
  const [messageOptions, setMessageOptions] = useState(false);
  const [pressedUpdate, setPressedUpdate] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showOptionsForm, setShowOptionsForm] = useState(false);

  const openDropdown = (e) => {
    setMessageOptions(!messageOptions);
  };

  const toggleOptionsForm = () => {
    setShowOptionsForm(!showOptionsForm);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const renderQuestionForm = () => {
    setShowForm(!showForm);
  };

  const [value, setValue] = useState("");

  const handleVote = (e) => {
    var channelParsedData = JSON.parse(currentChannel.data);
    var options = channelParsedData[message.messageId]["voting_app_options"];
    var optionVotingFor = e.target.dataset.option;
    var currentUserId = parseInt(userId);
    var objIndex = options.findIndex(
      (option) => option.title === optionVotingFor
    );
    if (options[objIndex].voters.includes(currentUserId)) {
      var filteredOptions = options[objIndex].voters.filter(
        (id) => id !== currentUserId
      );
      options[objIndex].voters = filteredOptions;
    } else {
      options[objIndex].voters.push(currentUserId);
    }
    var channelParams = new sdk.GroupChannelParams();
    var channelDataString = JSON.stringify(channelParsedData);
    channelParams.data = channelDataString;
    currentChannel.updateChannel(channelParams, (err, channel) => {
      var parsedChannelData = JSON.parse(channelParams.data);
      console.log("updatedChannelParamsData new=", parsedChannelData);
    });
  };

  const handleOptionsSubmit = (e) => {
    // e.preventDefault();
    var messageId = message.messageId;
    var newOption = {
      title: value,
      voters: [messageId],
      created_by: message._sender.nickname,
    };
    var channelParams = new sdk.GroupChannelParams();
    var parsedChannelData = JSON.parse(currentChannel.data);
    var messageData = parsedChannelData[messageId];
    var votingOptions = messageData["voting_app_options"];
    votingOptions.push(newOption);
    var channelDataString = JSON.stringify(parsedChannelData);
    channelParams.data = channelDataString;
    currentChannel.updateChannel(channelParams, (err, channel) => {
      var parsedChannelData = JSON.parse(channelParams.data);
      console.log("updatedChannelParamsData set=", parsedChannelData);
    });
  };

  var channelParsedData = JSON.parse(currentChannel.data);
  var suggestionMessage = channelParsedData[message.messageId];
  var votingOptions = false;
  //suggestionMessage['voting_app_options'] !== undefined
  // suggestionMessage.hasOwnProperty('voting_app_options')

  //going thru the channels params **

  console.log("outside; channelData=", channelParsedData);
  if (suggestionMessage) {
    // console.log('voting_app_options', suggestionMessage['voting_app_options'])
    //options array is defined already b/c created onUpdate of message to be a voting message

    votingOptions =
      suggestionMessage["voting_app_options"].length === 0
        ? false
        : suggestionMessage["voting_app_options"];
  }

  return (
    <div className="user-message">
      <Card>
        <CardHeader
          avatar={
            message.sender ? (
              <Avatar alt="Us" src={message.sender.plainProfileUrl} />
            ) : (
              <Avatar className="user-message__avatar">Us</Avatar>
            )
          }
          title={
            message.sender
              ? message.sender.nickname || message.sender.userId
              : "(No name)"
          }
        />
        <CardContent>
          {!pressedUpdate && (
            <Typography variant="body2" component="p">
              {message.message}
              {!showOptionsForm && (
                <button onClick={toggleOptionsForm} id="add-options-btn">
                  Add Options
                </button>
              )}

              {showOptionsForm && (
                <div>
                  <form onSubmit={(e) => handleOptionsSubmit(e)}>
                    <label htmlFor="question">Option:</label>
                    <br></br>
                    <input
                      type="text"
                      id="option"
                      name="option"
                      value={value}
                      onChange={handleChange}
                    />
                    <br></br>
                    <input type="submit" value="Submit" />
                    <button onClick={toggleOptionsForm}>Cancel</button>
                  </form>
                </div>
              )}
              {votingOptions &&
                votingOptions.map(function (option) {
                  return (
                    <div>
                      <h3>{option.title}</h3>
                      {option.voters && <h4>{option.voters.length}</h4>}
                      <button onClick={handleVote} data-option={option.title}>
                        Vote
                      </button>
                    </div>
                  );
                })}
            </Typography>
          )}
          {pressedUpdate && (
            <div className="user-message__text-area">
              <TextField
                multiline
                variant="filled"
                rowsMax={4}
                value={messageText}
                onChange={(event) => {
                  changeMessageText(event.target.value);
                }}
              />
            </div>
          )}
        </CardContent>
        <button
          className="user-message__options-btn"
          onClick={(e) => openDropdown(e)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path
              className="icon-more_svg__fill"
              d="M32 45.333a5.333 5.333 0 110 10.666 5.333 5.333 0 010-10.666zM32 28a5.333 5.333 0 110 10.668A5.333 5.333 0 0132 28zm0-17.333c2.946 0 5.333 2.387 5.333 5.333S34.946 21.333 32 21.333 26.667 18.946 26.667 16s2.387-5.333 5.333-5.333z"
              fill="#000"
              fillRule="evenodd"
            ></path>
          </svg>
        </button>
        {messageOptions && (
          <div className="message-options-wrap">
            <ul className="sendbird_dropdown_menu">
              {message.sender && message.sender.userId === userId && (
                <div>
                  {!pressedUpdate && !showForm && (
                    <li
                      className="dropdown__menu-item"
                      onClick={renderQuestionForm}
                    >
                      <span className="dropdown__menu-item-text">
                        Suggest Task
                      </span>
                    </li>
                  )}

                  {showForm && (
                    <div>
                      <QuestionForm
                        sdk={sdk}
                        currentChannel={currentChannel}
                        renderQuestionForm={renderQuestionForm}
                      />
                    </div>
                  )}

                  {pressedUpdate && (
                    <li
                      className="dropdown__menu-item"
                      onClick={() => setPressedUpdate(false)}
                    >
                      <span className="dropdown__menu-item-text">Cancel</span>
                    </li>
                  )}

                  {!pressedUpdate && !showForm && (
                    <li
                      className="dropdown__menu-item"
                      onClick={() => {
                        setPressedUpdate(true);
                      }}
                    >
                      <span className="dropdown__menu-item-text">Edit</span>
                    </li>
                  )}

                  {pressedUpdate && (
                    <li
                      className="dropdown__menu-item"
                      onClick={() =>
                        onUpdateMessage(message.messageId, messageText)
                      }
                    >
                      <span className="dropdown__menu-item-text">Save</span>
                    </li>
                  )}

                  {!pressedUpdate && !showForm && (
                    <li
                      className="dropdown__menu-item"
                      onClick={() => onDeleteMessage(message)}
                    >
                      <span className="dropdown__menu-item-text">Delete</span>
                    </li>
                  )}
                </div>
              )}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
