import React from "react";
import "./add-suggestion.css";
import { TextField } from "@material-ui/core";

export default function AddSuggestedTask({
  messageText,
  changeMessageText,
  changeSuggestionSubmit,
  setShowForm,
}) {
  return (
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
      <ul className="add_suggested_task_btns_wrap">
        <li
          className="add_suggested_task_save_btn"
          onClick={(e) => changeSuggestionSubmit(e)}
        >
          <span className="dropdown__menu-item-text">Save</span>
        </li>

        <li
          className="add_suggested_task_cancel_btn"
          onClick={() => setShowForm(false)}
        >
          <span className="dropdown__menu-item-text">Cancel</span>
        </li>
      </ul>
    </div>
  );
}
