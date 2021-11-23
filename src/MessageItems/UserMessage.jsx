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

export default function UserMessage(props) {
  // props

  const {
    message,
    userId,
    onDeleteMessage,
    onUpdateMessage,
    sdk,
    currentChannel,
    updateMessageParams,
  } = props;

  // useState
  const [messageText, changeMessageText] = useState(message.message);
  const [messageOptions, setMessageOptions] = useState(false);
  const [pressedUpdate, setPressedUpdate] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const openDropdown = (e) => {
    setMessageOptions(!messageOptions);
  };

  const renderQuestionForm = () => {
    setShowForm(!showForm);
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
          {!pressedUpdate && (
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
            <div className="user-message__text-area">
              {/* <TextField
                multiline
                variant="filled"
                rowsMax={4}
                value={messageText}
                onChange={(event) => {
                  changeMessageText(event.target.value);
                }}
              /> */}
              <QuestionForm 
              sdk={sdk}
              currentChannel={currentChannel}
              renderQuestionForm={renderQuestionForm}
              message={message}
              messageText={messageText}
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

                  {showForm && (
                    <li
                      className="dropdown__menu-item"
                      onClick={() =>
                        onUpdateMessage(message.messageId, messageText)
                      }
                      // onClick={() => handleSubmit(message, messageText)}
                      // onClick={() => updateMessageParams(message, messageText) }
                    >
                      <span className="dropdown__menu-item-text">Save</span>
                    </li>
                  )}

                  {showForm && (
                    <li
                      className="dropdown__menu-item"
                      onClick={() => setShowForm(false)}
                    >
                      <span className="dropdown__menu-item-text">Cancel</span>
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
