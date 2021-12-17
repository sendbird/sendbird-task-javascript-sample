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

export default function UserMessage(props) {
  const {
    message,
    userId,
    onDeleteMessage,
    onUpdateMessage,
    sdk,
    currentChannel,
    updateLastMessage,
    config = {},
  } = props;

  const [messageText, changeMessageText] = useState(message.message);
  const [messageOptions, setMessageOptions] = useState(false);
  const [pressedUpdate, setPressedUpdate] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const clickedDropdown = () => {
    setMessageOptions(!messageOptions);
  };

  const renderQuestionForm = () => {
    setShowForm(true);
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

  //calls what onUpdateMessage is equal to
  const updateVotingMessage = useUpdateMessageCallback(
    {
      currentChannel,
      messagesDispatcher,
      onBeforeUpdateUserMessage,
      updateLastMessage,
    },
    { logger, sdk, pubSub }
  );

  const suggestionSubmit = (e) => {
    e.preventDefault();
    updateVotingMessage(message.messageId, messageText);
    setMessageOptions(!messageOptions);
    changeMessageText("");
    setShowForm(false);
  };

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
          {!pressedUpdate && !showForm && (
            <Typography variant="body2" component="p">
              {message.message}
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
          {showForm && (
            <AddSuggestedTask
              messageText={messageText}
              changeMessageText={changeMessageText}
              changeSuggestionSubmit={suggestionSubmit}
              setShowForm={setShowForm}
            />
          )}
        </CardContent>
        <button className="user-message__options-btn" onClick={clickedDropdown}>
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
                      id="suggest_task_button"
                      className="suggest_task_button"
                      onClick={renderQuestionForm}
                    >
                      <span className="suggest_task_button">Suggest a Task</span>
                    </li>
                  )}
                  {pressedUpdate && !showForm && (
                    <li
                      className="dropdown__menu-item"
                      onClick={() =>
                        onUpdateMessage(message.messageId, messageText)
                      }
                    >
                      <span className="dropdown__menu-item-text">Save</span>
                    </li>
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
