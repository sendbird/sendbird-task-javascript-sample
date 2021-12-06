import React from "react";
import "./add-suggestion.css";

export default function AddSuggestedTask({
  messageText,
  changeMessageText,
  changeSuggestionSubmit,
  setShowForm,
}) {
  return (
    <div className="bg-modal" style={{'display': 'flex'}}>
      <div className="modal-content">
        <div className="add_suggested_task_close_btn"   onClick={() => setShowForm(false)} >+</div>
        <form onSubmit={(e) => {changeSuggestionSubmit(e)}}>
          <input
            type="text"
            placeholder="Suggested Task"
            value={messageText}
            onChange={(event) => {
              changeMessageText(event.target.value);
            }}
          ></input>
          <button className="add_suggested_task_save_btn">Submit</button>
        </form>
      </div>
    </div>
  );
};