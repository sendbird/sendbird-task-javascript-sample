import React, { useState, useReducer, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  Avatar,
  CardContent,
  Typography,
  TextField,
} from "@material-ui/core";
import "./index.css";
import useUpdateMessageCallback from "./UpdateComponents/useUpdateMessageCallback";
import messagesReducer from "./UpdateComponents/ReducersComponents/reducers";
import messagesInitialState from "./UpdateComponents/ReducersComponents/initialState";
import pubSubFactory from "./UpdateComponents/ReducersComponents/pubSubIndex";
import { LoggerFactory } from "./UpdateComponents/logger";
import * as utils from "./UpdateComponents/ReducersComponents/utils";
import useHandleChannelEvents from "./UpdateComponents/useHandleChannelEvents";
import AddSuggestedTask from "./AddSuggestedTask";

export default function VotingMessage(props) {
  // props
  const {
    message,
    userId,
    onDeleteMessage,
    sdk,
    currentChannel,
    updateLastMessage,
    config = {},
  } = props;

  // useState
  const [messageText, changeMessageText] = useState(message.message);
  const [messageOptions, setMessageOptions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [optionsValue, setOptionsValue] = useState("");

  const openDropdown = () => {
    setMessageOptions(!messageOptions);
  };

  const [messagesStore, messagesDispatcher] = useReducer(
    messagesReducer,
    messagesInitialState
  );

  const updateChannelParams = () => {
    var channelParams = new sdk.GroupChannelParams();
    var messageId = message.messageId;
    var channelDataString = "";
    if (currentChannel.data) {
      var parsedChannelData = JSON.parse(currentChannel.data);
      parsedChannelData[`${messageId}`] = {
        voting_app_options: [],
      };
      channelDataString = JSON.stringify(parsedChannelData);
    } else {
      var newChannelData = {};
      newChannelData[`${messageId}`] = {
        voting_app_options: [],
      };
      channelDataString = JSON.stringify(newChannelData);
    }
    channelParams.data = channelDataString;
    currentChannel.updateChannel(channelParams, (err, channel) => {
      var parsedChannelData = JSON.parse(channelParams.data);
      console.log("updatedChannelParamsData new=", parsedChannelData);
    });
  };

  const onBeforeUpdateUserMessage = (text) => {
    updateChannelParams();
    const userMessageParams = new sdk.UserMessageParams();
    var jsonMessageData = {
      type: "VOTING_APP",
      version: 1,
      title: `${text}`,
    };
    var jsonString = JSON.stringify(jsonMessageData);
    userMessageParams.data = jsonString;
    userMessageParams.customType = "VOTING_APP";
    userMessageParams.message = text;
    return userMessageParams;
  };

  const sdkInit = sdk.initialized;

  //https://github.com/sendbird/uikit-js/blob/8214485dee0b8a211261a629427e9f56ba867f50/src/lib/Sendbird.jsx
  const [pubSub, setPubSub] = useState();
  useEffect(() => {
    setPubSub(pubSubFactory());
  }, []);

  // handles API calls from withSendbird
  useEffect(() => {
    const subScriber = utils.pubSubHandler(
      currentChannel.url,
      pubSub,
      messagesDispatcher
    );
    return () => {
      utils.pubSubHandleRemover(subScriber);
    };
  }, [currentChannel.url, sdkInit, pubSub]);

  const { logLevel = "" } = config;
  const [logger, setLogger] = useState(LoggerFactory(logLevel));
  useEffect(() => {
    setLogger(LoggerFactory(logLevel));
  }, [logLevel]);

  const scrollRef = useRef(null);
  const { hasMoreToBottom } = messagesStore;

  // Hook to handle ChannelEvents and send values to useReducer using messagesDispatcher
  useHandleChannelEvents(
    { currentChannel, sdkInit, hasMoreToBottom },
    {
      messagesDispatcher,
      sdk,
      logger,
      scrollRef,
    }
  );

  const updateVotingMessage = useUpdateMessageCallback(
    {
      currentChannel,
      messagesDispatcher,
      onBeforeUpdateUserMessage,
      updateLastMessage,
    },
    { logger, sdk, pubSub }
  );

  const changeSuggestionSubmit = (e) => {
    e.preventDefault();
    updateVotingMessage(message.messageId, messageText);
    setMessageOptions(!messageOptions);
    changeMessageText("");
    setShowForm(false);
  };

  const toggleOptionsForm = () => {
    setShowOptionsForm(!showOptionsForm);
  };

  const renderQuestionForm = () => {
    setShowForm(!showForm);
  };

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
    e.preventDefault();
    setShowOptionsForm(false);
    var messageId = message.messageId;
    var currentUserId = parseInt(userId);
    var channelParams = new sdk.GroupChannelParams();
    var parsedChannelData = JSON.parse(currentChannel.data);
    var messageData = parsedChannelData[messageId];
    var votingOptions = messageData["voting_app_options"];
    console.log("options:", votingOptions.length);
    var optionNumber = votingOptions.length + 1;

    var newOption = {
      id: optionNumber,
      title: optionsValue,
      voters: [currentUserId],
      created_by: message._sender.nickname,
    };

    votingOptions.push(newOption);
    var channelDataString = JSON.stringify(parsedChannelData);
    channelParams.data = channelDataString;
    currentChannel.updateChannel(channelParams, (err, channel) => {
      var parsedChannelData = JSON.parse(channelParams.data);
      console.log("updatedChannelParamsData set=", parsedChannelData);
    });
    setOptionsValue("");
  };

  var channelParsedData = JSON.parse(currentChannel.data);
  var suggestionMessage = channelParsedData[message.messageId];
  var votingOptions = false;
  if (suggestionMessage["voting_app_options"]) {
    votingOptions =
      suggestionMessage["voting_app_options"].length === 0
        ? false
        : suggestionMessage["voting_app_options"];
  }

  return (
    <div className="voting-message">
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
          {
            <Typography variant="body2" component="p">
              {message.message}
              {!showOptionsForm && (
                <div>
                  <button onClick={toggleOptionsForm} id="add-options-btn">
                    + Add Option
                  </button>
                </div>
              )}
              {showOptionsForm && (
                <div id="option-form">
                  <form onSubmit={(e) => handleOptionsSubmit(e)}>
                    <label htmlFor="question" id="option-header">
                      Option:
                    </label>
                    <br></br>
                    <input
                      type="text"
                      id="option-input"
                      name="option"
                      value={optionsValue}
                      onChange={(e) => {
                        setOptionsValue(e.target.value);
                      }}
                    />
                    <br></br>
                    <input
                      type="submit"
                      value="Submit"
                      id="option-submit-btn"
                    />
                    <button onClick={toggleOptionsForm} id="option-cancel-btn">
                      Cancel
                    </button>
                  </form>
                </div>
              )}
              {votingOptions &&
                votingOptions.map(function (option) {
                  return (
                    <div id="options-wrapper">
                      <p id="option-title">
                        <p id="option-number-text">{option.id}</p>:{" "}
                        {option.title}
                      </p>
                      {option.voters && (
                        <p id="option-vote-count">
                          <p id="total-votes-text">Total Votes:</p>{" "}
                          {option.voters.length}
                        </p>
                      )}
                    </div>
                  );
                })}
              <div id="vote-buttons-wrapper">
                {votingOptions &&
                  votingOptions.map(function (option) {
                    return (
                      <div id="vote-button-wrap">
                        <button
                          onClick={handleVote}
                          data-option={option.title}
                          id="vote-btn"
                        >
                          {option.id}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </Typography>
          }
          {showForm && (
            <AddSuggestedTask
              messageText={messageText}
              changeMessageText={changeMessageText}
              changeSuggestionSubmit={changeSuggestionSubmit}
              setShowForm={setShowForm}
            />
          )}
        </CardContent>
        <button className="user-message__options-btn" onClick={openDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path
              className="icon-more_svg__fill"
              d="M32 45.333a5.333 5.333 0 110 10.666 5.333 5.333 0 010-10.666zM32 28a5.333 5.333 0 110 10.668A5.333 5.333 0 0132 28zm0-17.333c2.946 0 5.333 2.387 5.333 5.333S34.946 21.333 32 21.333 26.667 18.946 26.667 16s2.387-5.333 5.333-5.333z"
              fill="#000"
              fillRule="evenodd"
            ></path>
          </svg>
        </button>
        {messageOptions && !showForm && (
          <div className="message-options-wrap">
            <ul className="sendbird_dropdown_menu">
              {message.sender && message.sender.userId === userId && (
                <div>
                  <li
                    className="dropdown__menu-item"
                    onClick={renderQuestionForm}
                  >
                    <span className="dropdown__menu-item-text">
                      Change Task
                    </span>
                  </li>

                  <li
                    className="dropdown__menu-item"
                    onClick={() => onDeleteMessage(message)}
                  >
                    <span className="dropdown__menu-item-text">Delete</span>
                  </li>
                </div>
              )}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
